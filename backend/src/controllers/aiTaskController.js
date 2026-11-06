import { interpretTaskMessage } from '../services/deepseek/taskInterpreter.js';
import { UserModel } from '../models/userModelModel.js';
import { Model } from '../models/modelModel.js';
import { isDatabaseConnected } from '../database/sequelize.js';
import { getUserTimezone, getTodayDateStr } from '../utils/dateUtils.js';

// Fallback de modelos em memória (sincronizado com userModelController)
const DEFAULT_MODELS_FALLBACK = [
  { id: 'mod-routine-1', type: 'routine', name: 'Agenda Visual' },
  { id: 'mod-calendario-1', type: 'calendario', name: 'Calendário' },
  { id: 'mod-pomodoro-1', type: 'pomodoro', name: 'Pomodoro' },
  { id: 'mod-braindump-1', type: 'brain-dump', name: 'Brain Dump' },
  { id: 'mod-microtasks-1', type: 'microtasks', name: 'Microtarefas' },
  { id: 'mod-kanban-1', type: 'kanban', name: 'Kanban' },
  { id: 'mod-matrix-1', type: 'priority-matrix', name: 'Matriz de Prioridades' },
  { id: 'mod-habits-1', type: 'habits', name: 'Rastreador de Hábitos' },
  { id: 'mod-dailyroutines-1', type: 'daily-routines', name: 'Rotinas Diárias' },
];

/**
 * Consulta os modelos dinâmicos atuais associados ao usuário autenticado.
 */
async function fetchUserModelsForAccount(accountId) {
  if (await isDatabaseConnected()) {
    const dbUserModels = await UserModel.findAll({
      where: { id_account: accountId },
      include: [{ model: Model, as: 'baseModel', required: false }],
      order: [['order_index', 'ASC'], ['id_user_model', 'ASC']],
    });

    if (dbUserModels && dbUserModels.length > 0) {
      return dbUserModels.map((m) => ({
        id: `mod-${m.type}-${m.id_user_model}`,
        dbId: m.id_user_model,
        type: m.type,
        name: m.name,
      }));
    }
  }

  return DEFAULT_MODELS_FALLBACK;
}

/**
 * POST /api/ai/interpret-task
 * Recebe instrução em linguagem natural, consulta modelos dinâmicos do usuário
 * e processa via DeepSeek Function Calling. NÃO salva no banco.
 */
export const interpretTask = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        status: 'needs_info',
        message: 'Por favor, informe a descrição da tarefa que você deseja adicionar.',
      });
    }

    const userTz = getUserTimezone(req);
    const todayStr = getTodayDateStr(userTz);

    // Consulta os modelos de organização atualmente disponíveis para aquele usuário no banco
    const userModels = await fetchUserModelsForAccount(userId);

    const result = await interpretTaskMessage({
      message,
      userModels,
      todayStr,
      userTimezone: userTz,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Erro em interpretTask:', err);
    return res.status(500).json({
      status: 'error',
      message: `Erro ao interpretar a tarefa com inteligência artificial: ${err.message}`,
    });
  }
};
