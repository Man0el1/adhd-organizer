// Controlador para salvar e recuperar modelos (múltiplas instâncias nomeadas) pelo usuário

export const VALID_TYPES = ['routine', 'calendario', 'pomodoro', 'brain-dump'];

export const DEFAULT_NAMES = {
  routine: 'Agenda Visual',
  calendario: 'Calendário',
  pomodoro: 'Pomodoro',
  'brain-dump': 'Brain Dump',
};

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

// Armazenamento em memória para as instâncias de modelos do usuário
let userModelPreferences = {
  default: [
    { id: 'mod-routine-1', type: 'routine', name: 'Agenda Visual' },
    { id: 'mod-calendario-1', type: 'calendario', name: 'Calendário' },
    { id: 'mod-pomodoro-1', type: 'pomodoro', name: 'Pomodoro' },
    { id: 'mod-braindump-1', type: 'brain-dump', name: 'Brain Dump' },
  ],
};

export const getUserModels = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'default';
    const models = userModelPreferences[userId] || userModelPreferences['default'];

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
    const userId = req.headers['x-user-id'] || 'default';
    const { models, selectedModelIds } = req.body;

    let incomingList = [];

    if (Array.isArray(models) && models.length > 0) {
      incomingList = models;
    } else if (Array.isArray(selectedModelIds) && selectedModelIds.length > 0) {
      // Compatibilidade retroativa caso venha array simples de IDs/tipos
      incomingList = selectedModelIds.map((item, index) => {
        if (typeof item === 'object' && item.type) return item;
        const type = VALID_TYPES.includes(item) ? item : 'routine';
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
      const type = VALID_TYPES.includes(item.type) ? item.type : 'routine';
      const defaultName = DEFAULT_NAMES[type] || 'Modelo';
      const rawName = (item.name && item.name.trim()) ? item.name.trim() : defaultName;
      const id = item.id || `mod-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Aplica numeração estilo Windows caso o nome já exista na lista atual
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

    userModelPreferences[userId] = normalizedList;
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
