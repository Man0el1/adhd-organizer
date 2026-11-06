export const createCalendarTaskTool = {
  type: 'function',
  function: {
    name: 'create_calendar_task',
    description: 'Interpreta e prepara uma tarefa para ser adicionada no modelo Calendário (agenda/eventos com data e prazos). Chame esta função APENAS quando o usuário indicar o modelo de Calendário e fornecer ao menos o nome da tarefa e a data.',
    parameters: {
      type: 'object',
      properties: {
        modelId: {
          type: 'string',
          description: 'O ID exato do modelo do usuário onde a tarefa será criada (escolhido obrigatoriamente a partir da lista de modelos disponíveis do usuário).',
        },
        taskName: {
          type: 'string',
          description: 'Título ou nome da tarefa.',
        },
        description: {
          type: 'string',
          description: 'Descrição detalhada ou anotações da tarefa.',
        },
        startDate: {
          type: 'string',
          description: 'Data da tarefa no formato YYYY-MM-DD.',
        },
        startTime: {
          type: 'string',
          description: 'Horário de início no formato HH:MM (ex: "10:00"). Opcional.',
        },
        endTime: {
          type: 'string',
          description: 'Horário de término no formato HH:MM (ex: "12:00"). Opcional.',
        },
        recurrence: {
          type: 'string',
          enum: ['none', 'daily', 'weekly', 'monthly', 'yearly'],
          description: 'Padrão de repetição da tarefa: "none", "daily", "weekly", "monthly" ou "yearly".',
        },
      },
      required: ['modelId', 'taskName', 'startDate'],
      additionalProperties: false,
    },
  },
};

/**
 * Validador seguro no backend para os argumentos de create_calendar_task.
 * Garante que tipos, datas, modelId e horários estão estritamente corretos.
 */
export function validateCalendarTaskArgs(args, userModels, currentDateStr) {
  const errors = [];
  const allowedKeys = new Set([
    'modelId',
    'taskName',
    'description',
    'startDate',
    'startTime',
    'endTime',
    'recurrence',
  ]);

  // Impede campos desconhecidos
  for (const key of Object.keys(args)) {
    if (!allowedKeys.has(key)) {
      errors.push(`Campo não reconhecido para o modelo Calendário: "${key}".`);
    }
  }

  // 1. Valida modelId
  if (!args.modelId) {
    errors.push('O ID do modelo não foi informado.');
  }

  const targetModel = userModels.find(
    (m) => String(m.id) === String(args.modelId) || String(m.dbId) === String(args.modelId)
  );

  if (!targetModel) {
    errors.push(`O modelo informado ("${args.modelId}") não pertence aos seus modelos cadastrados.`);
  } else if (targetModel.type !== 'calendario') {
    errors.push(
      `O modelo selecionado "${targetModel.name}" é do tipo "${targetModel.type}", não é um modelo de Calendário.`
    );
  }

  // 2. Valida taskName
  if (!args.taskName || typeof args.taskName !== 'string' || !args.taskName.trim()) {
    errors.push('O nome da tarefa é obrigatório.');
  }

  // 3. Valida startDate (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!args.startDate || !dateRegex.test(args.startDate)) {
    errors.push('A data da tarefa é obrigatória e deve estar no formato AAAA-MM-DD.');
  } else if (currentDateStr && args.startDate < currentDateStr) {
    errors.push(
      `A data informada (${args.startDate}) não pode ser anterior à data de hoje (${currentDateStr}).`
    );
  }

  // 4. Valida startTime / endTime se fornecidos
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (args.startTime) {
    if (!timeRegex.test(args.startTime)) {
      errors.push('O horário de início deve estar no formato HH:MM (ex: 10:00).');
    }
  }

  if (args.endTime) {
    if (!timeRegex.test(args.endTime)) {
      errors.push('O horário de término deve estar no formato HH:MM (ex: 12:00).');
    }
  }

  if (args.startTime && args.endTime && timeRegex.test(args.startTime) && timeRegex.test(args.endTime)) {
    if (args.startTime >= args.endTime) {
      errors.push('O horário de término deve ser posterior ao horário de início.');
    }
  }

  // 5. Valida enum de recurrence
  const validRecurrences = ['none', 'daily', 'weekly', 'monthly', 'yearly'];
  const recurrence = args.recurrence || 'none';
  if (!validRecurrences.includes(recurrence)) {
    errors.push(`Recorrência inválida: "${recurrence}". Valores aceitos: ${validRecurrences.join(', ')}.`);
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  // Monta payload limpo e seguro normalizado para confirmação / posterior criação
  const recurrenceLabels = {
    none: 'Não repete',
    daily: 'Diariamente',
    weekly: 'Semanalmente',
    monthly: 'Mensalmente',
    yearly: 'Anualmente',
  };

  const formattedDate = args.startDate.split('-').reverse().join('/');

  return {
    isValid: true,
    targetModel: {
      id: targetModel.id,
      name: targetModel.name,
      type: targetModel.type,
    },
    structuredTask: {
      modelId: targetModel.id,
      name: args.taskName.trim(),
      description: (args.description || '').trim(),
      date: args.startDate,
      startTime: args.startTime || null,
      endTime: args.endTime || null,
      recurrence,
    },
    summaryFields: [
      { label: 'Modelo', value: targetModel.name },
      { label: 'Tarefa', value: args.taskName.trim() },
      ...(args.description?.trim() ? [{ label: 'Descrição', value: args.description.trim() }] : []),
      { label: 'Data', value: formattedDate },
      ...(args.startTime ? [{ label: 'Início', value: args.startTime }] : []),
      ...(args.endTime ? [{ label: 'Término', value: args.endTime }] : []),
      { label: 'Recorrência', value: recurrenceLabels[recurrence] || recurrence },
    ],
  };
}
