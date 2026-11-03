import { UserModel } from '../models/userModelModel.js';
import { Model } from '../models/modelModel.js';
import { isDatabaseConnected } from '../database/sequelize.js';

export const VALID_TYPES = [
  'routine',
  'calendario',
  'pomodoro',
  'brain-dump',
  'microtasks',
  'kanban',
  'priority-matrix',
  'habits',
  'daily-routines',
];

export const DEFAULT_NAMES = {
  routine: 'Agenda Visual',
  calendario: 'Calendário',
  pomodoro: 'Pomodoro',
  'brain-dump': 'Brain Dump',
  microtasks: 'Microtarefas',
  kanban: 'Kanban',
  'priority-matrix': 'Matriz de Prioridades',
  habits: 'Rastreador de Hábitos',
  'daily-routines': 'Rotinas Diárias',
};

export function inferModelType(type, name = '', id = '') {
  if (type && VALID_TYPES.includes(type)) return type;
  const str = `${type || ''} ${name || ''} ${id || ''}`.toLowerCase();
  if (str.includes('habit') || str.includes('hábito')) return 'habits';
  if (str.includes('rotina') || str.includes('daily-routine')) return 'daily-routines';
  if (str.includes('micro')) return 'microtasks';
  if (str.includes('kanban')) return 'kanban';
  if (str.includes('matriz') || str.includes('priorit') || str.includes('matrix')) return 'priority-matrix';
  if (str.includes('brain')) return 'brain-dump';
  if (str.includes('cal')) return 'calendario';
  if (str.includes('pomo')) return 'pomodoro';
  return 'routine';
}

// Gera nomes com incremento no estilo Windows quando há duplicatas:
// "Agenda Visual", "Agenda Visual (2)", "Agenda Visual (3)"
export function generateUniqueModelName(baseName, existingList, currentId = null) {
  const existingNames = existingList
    .filter((m) => (currentId ? m.id !== currentId : true))
    .map((m) => (typeof m === 'string' ? m : m.name));

  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 2;
  while (existingNames.includes(`${baseName} (${counter})`)) {
    counter++;
  }
  return `${baseName} (${counter})`;
}

// Armazenamento em memória (fallback caso PostgreSQL não esteja configurado)
let userModelPreferences = {
  default: [
    { id: 'mod-routine-1', type: 'routine', name: 'Agenda Visual' },
    { id: 'mod-calendario-1', type: 'calendario', name: 'Calendário' },
    { id: 'mod-pomodoro-1', type: 'pomodoro', name: 'Pomodoro' },
    { id: 'mod-braindump-1', type: 'brain-dump', name: 'Brain Dump' },
    { id: 'mod-microtasks-1', type: 'microtasks', name: 'Microtarefas' },
    { id: 'mod-kanban-1', type: 'kanban', name: 'Kanban' },
    { id: 'mod-matrix-1', type: 'priority-matrix', name: 'Matriz de Prioridades' },
    { id: 'mod-habits-1', type: 'habits', name: 'Rastreador de Hábitos' },
    { id: 'mod-dailyroutines-1', type: 'daily-routines', name: 'Rotinas Diárias' },
  ],
};

const DEFAULT_MODELS_SEED = [
  { type: 'routine', name: 'Agenda Visual', order_index: 0 },
  { type: 'calendario', name: 'Calendário', order_index: 1 },
  { type: 'pomodoro', name: 'Pomodoro', order_index: 2 },
  { type: 'brain-dump', name: 'Brain Dump', order_index: 3 },
  { type: 'microtasks', name: 'Microtarefas', order_index: 4 },
  { type: 'kanban', name: 'Kanban', order_index: 5 },
  { type: 'priority-matrix', name: 'Matriz de Prioridades', order_index: 6 },
  { type: 'habits', name: 'Rastreador de Hábitos', order_index: 7 },
  { type: 'daily-routines', name: 'Rotinas Diárias', order_index: 8 },
];

export const getUserModels = async (req, res) => {
  try {
    const accountId = req.user?.id || Number(req.headers['x-user-id']) || 1;

    // Se o banco PostgreSQL estiver configurado, utiliza os métodos do Sequelize
    if (await isDatabaseConnected()) {
      let dbUserModels = await UserModel.findAll({
        where: { id_account: accountId },
        include: [{ model: Model, as: 'baseModel', required: false }],
        order: [['order_index', 'ASC'], ['id_user_model', 'ASC']],
      });

      // Se o usuário ainda não tiver modelos persistidos, inicializa os modelos padrão
      if (dbUserModels.length === 0) {
        const baseModels = await Model.findAll();
        const baseMap = {};
        baseModels.forEach((bm) => {
          baseMap[bm.type] = bm.id_model;
        });

        const seedData = DEFAULT_MODELS_SEED.map((seed) => ({
          id_account: accountId,
          id_model: baseMap[seed.type] || null,
          type: seed.type,
          name: seed.name,
          order_index: seed.order_index,
        }));

        await UserModel.bulkCreate(seedData);

        dbUserModels = await UserModel.findAll({
          where: { id_account: accountId },
          include: [{ model: Model, as: 'baseModel', required: false }],
          order: [['order_index', 'ASC'], ['id_user_model', 'ASC']],
        });
      }

      const formatted = dbUserModels.map((m) => {
        const resolvedType = inferModelType(m.type, m.name, `mod-${m.type}-${m.id_user_model}`);
        return {
          id: `mod-${resolvedType}-${m.id_user_model}`,
          dbId: m.id_user_model,
          type: resolvedType,
          name: m.name,
          order_index: m.order_index,
        };
      });

      return res.status(200).json({
        models: formatted,
        selectedModelIds: formatted.map((m) => m.id),
      });
    }

    // Fallback em memória quando PostgreSQL não está configurado
    const key = String(accountId);
    const rawModels = userModelPreferences[key] || userModelPreferences['default'];
    const models = (rawModels || []).map((m) => {
      const resolvedType = inferModelType(m.type, m.name, m.id);
      return {
        ...m,
        type: resolvedType,
      };
    });

    return res.status(200).json({
      models,
      selectedModelIds: models.map((m) => m.id),
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao obter modelos do usuário: ${e.message}` });
  }
};

export const updateUserModels = async (req, res) => {
  try {
    const accountId = req.user?.id || Number(req.headers['x-user-id']) || 1;
    const { models, selectedModelIds } = req.body;

    let incomingList = [];

    if (Array.isArray(models) && models.length > 0) {
      incomingList = models;
    } else if (Array.isArray(selectedModelIds) && selectedModelIds.length > 0) {
      incomingList = selectedModelIds.map((item, index) => {
        if (typeof item === 'object' && item.type) return item;
        const type = inferModelType(item, '', `mod-${item}-${index + 1}`);
        return {
          id: `mod-${type}-${index + 1}`,
          type,
          name: DEFAULT_NAMES[type] || 'Modelo',
        };
      });
    } else {
      return res.status(400).json({
        message: 'Você deve ter pelo menos um modelo cadastrado na barra lateral.',
      });
    }

    // Normaliza, garante IDs únicos e aplica regra de nomes estilo Windows para duplicatas
    const normalizedList = [];
    for (const item of incomingList) {
      const type = inferModelType(item.type, item.name, item.id);
      const defaultName = DEFAULT_NAMES[type] || 'Modelo';
      const rawName = (item.name && item.name.trim()) ? item.name.trim() : defaultName;
      const id = item.id || `mod-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      const uniqueName = generateUniqueModelName(rawName, normalizedList);

      normalizedList.push({
        id,
        type,
        name: uniqueName,
      });
    }

    if (normalizedList.length === 0) {
      return res.status(400).json({ message: 'Nenhum modelo válido fornecido.' });
    }

    // Se o banco PostgreSQL estiver conectado, persiste usando Sequelize
    if (await isDatabaseConnected()) {
      const baseModels = await Model.findAll();
      const baseMap = {};
      baseModels.forEach((bm) => {
        baseMap[bm.type] = bm.id_model;
      });

      // Substitui os modelos cadastrados pelo usuário para essa conta
      await UserModel.destroy({ where: { id_account: accountId } });

      const recordsToInsert = normalizedList.map((m, idx) => ({
        id_account: accountId,
        id_model: baseMap[m.type] || null,
        type: m.type,
        name: m.name,
        order_index: idx,
      }));

      const created = await UserModel.bulkCreate(recordsToInsert);

      const formatted = created.map((m) => ({
        id: `mod-${m.type}-${m.id_user_model}`,
        dbId: m.id_user_model,
        type: m.type,
        name: m.name,
        order_index: m.order_index,
      }));

      return res.status(200).json({
        message: 'Modelos salvos no banco PostgreSQL com sucesso!',
        models: formatted,
        selectedModelIds: formatted.map((m) => m.id),
      });
    }

    // Fallback em memória
    const key = String(accountId);
    userModelPreferences[key] = normalizedList;
    userModelPreferences['default'] = normalizedList;

    return res.status(200).json({
      message: 'Modelos salvos no backend com sucesso!',
      models: normalizedList,
      selectedModelIds: normalizedList.map((m) => m.id),
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao salvar modelos: ${e.message}` });
  }
};
