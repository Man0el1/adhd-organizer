// Armazenamento em memória para tarefas — sem conceito de Space
let inMemoryTasks = [];

// Helper para verificar se uma tarefa (incluindo recorrentes) se aplica a uma data específica
export const matchesTargetDate = (task, targetDateStr) => {
  if (!task.date) return true;
  if (task.date === targetDateStr) return true;

  const recurrence = task.recurrence || 'none';
  if (recurrence === 'none') return false;

  const taskDate = new Date(task.date + 'T00:00:00');
  const targetDate = new Date(targetDateStr + 'T00:00:00');

  // Tarefas futuras não se aplicam a datas anteriores à sua criação
  if (taskDate > targetDate) return false;

  if (recurrence === 'daily') {
    return true;
  }

  if (recurrence === 'weekly') {
    return taskDate.getDay() === targetDate.getDay();
  }

  if (recurrence === 'monthly') {
    return taskDate.getDate() === targetDate.getDate();
  }

  if (recurrence === 'yearly') {
    return (
      taskDate.getDate() === targetDate.getDate() &&
      taskDate.getMonth() === targetDate.getMonth()
    );
  }

  return false;
};

export const getTasks = async (req, res) => {
  try {
    const { modelId, modelType, targetDate, today } = req.query;
    const todayStr = today || new Date().toISOString().split('T')[0];
    const viewDateStr = targetDate || todayStr;

    let filtered = [...inMemoryTasks];

    // Filtra estritamente pelo ID do modelo selecionado
    if (modelId) {
      filtered = filtered.filter((t) => {
        if (!t.modelIds || !Array.isArray(t.modelIds)) return false;
        // Correspondência exata com a instância selecionada
        if (t.modelIds.includes(modelId)) return true;

        // Suporte a compatibilidade apenas caso a tarefa tenha sido criada com o tipo genérico
        if (modelId === 'routine' && t.modelIds.includes('routine')) return true;
        if (modelId === 'calendario' && t.modelIds.includes('calendario')) return true;
        if (modelId === 'brain-dump' && t.modelIds.includes('brain-dump')) return true;

        return false;
      });
    }

    // Regra específica para Agenda Visual:
    // Mostra as tarefas do dia selecionado + se for hoje, traz tarefas pendentes de dias anteriores
    const isRoutine =
      modelId === 'routine' ||
      modelType === 'routine' ||
      (typeof modelId === 'string' && modelId.includes('routine'));

    if (isRoutine) {
      const isViewingToday = viewDateStr === todayStr;

      filtered = filtered
        .map((task) => {
          const isFromTargetDate = matchesTargetDate(task, viewDateStr);
          // Overdue só é exibido se o usuário estiver visualizando o dia de hoje
          const isOverdue = Boolean(isViewingToday && task.date && task.date < todayStr && !task.done);

          return {
            ...task,
            isOverdue,
            isFromTargetDate,
          };
        })
        .filter((task) => task.isFromTargetDate || task.isOverdue);
    }

    return res.status(200).json({ tasks: filtered });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao buscar tarefas: ${e.message}` });
  }
};

// Retorna contagem de tarefas disponíveis/agendadas para hoje em cada modelo (para exibir notificação na barra lateral)
export const getTodayCounts = async (req, res) => {
  try {
    const todayStr = req.query.today || new Date().toISOString().split('T')[0];
    const counts = {};

    inMemoryTasks.forEach((task) => {
      if (task.done) return;

      const isForToday = matchesTargetDate(task, todayStr);
      const isOverdue = Boolean(task.date && task.date < todayStr);
      const models = task.modelIds || [];

      models.forEach((mid) => {
        // Routine (Agenda Visual): tarefas de hoje ou atrasadas de dias anteriores
        if (mid === 'routine' || mid.includes('routine')) {
          if (isForToday || isOverdue) {
            counts[mid] = (counts[mid] || 0) + 1;
          }
        }

        // Calendário: eventos/prazos de hoje
        if (mid === 'calendario' || mid.includes('calendario')) {
          if (isForToday) {
            counts[mid] = (counts[mid] || 0) + 1;
          }
        }

        // Brain Dump: pensamentos/itens ativos pendentes
        if (mid === 'brain-dump' || mid.includes('brain')) {
          counts[mid] = (counts[mid] || 0) + 1;
        }
      });
      // Pomodoro não possui notificação conforme solicitado pelo usuário
    });

    return res.status(200).json({ today: todayStr, counts });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao obter contagens de hoje: ${e.message}` });
  }
};

// Adiciona minutos a um horário "HH:MM"
export const addMinutesToTime = (timeStr, minutesToAdd = 1) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10));
  if (isNaN(h) || isNaN(m)) return timeStr;

  let totalMins = h * 60 + m + minutesToAdd;
  if (totalMins >= 24 * 60) {
    totalMins = 23 * 60 + 59;
  }
  const newH = String(Math.floor(totalMins / 60)).padStart(2, '0');
  const newM = String(totalMins % 60).padStart(2, '0');
  return `${newH}:${newM}`;
};

export const createTask = async (req, res) => {
  try {
    const {
      name,
      description = '',
      notes = '',
      modelIds = [],
      date,
      startTime,
      endTime,
      recurrence = 'none',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'O nome da tarefa é obrigatório.' });
    }

    if (!modelIds || modelIds.length === 0) {
      return res.status(400).json({ message: 'Selecione pelo menos um modelo para a tarefa.' });
    }

    // Caso o horário inicial seja depois ou igual ao horário de término,
    // ajusta automaticamente o término para o horário inicial + 1 minuto
    let finalEndTime = endTime || null;
    if (startTime && endTime && startTime >= endTime) {
      finalEndTime = addMinutesToTime(startTime, 1);
    }

    // Se o modelo de Agenda Visual (Rotina) estiver selecionado, horário de início é obrigatório
    const requiresTime = modelIds.some(
      (m) => m === 'routine' || m === 'agenda-visual' || m.includes('routine')
    );
    if (requiresTime && !startTime) {
      return res.status(400).json({
        message: 'O horário de início é obrigatório quando a Agenda Visual está selecionada.',
      });
    }

    // Se Calendário ou Agenda Visual estiverem selecionados, data é obrigatória
    const requiresDate = modelIds.some(
      (m) =>
        m === 'calendario' ||
        m === 'routine' ||
        m === 'agenda-visual' ||
        m.includes('calendario') ||
        m.includes('routine')
    );
    if (requiresDate && !date) {
      return res.status(400).json({ message: 'A data é obrigatória para os modelos selecionados.' });
    }

    const finalDescription = (description || notes || '').trim();

    const newTask = {
      id: `task-${Date.now()}`,
      name: name.trim(),
      description: finalDescription,
      notes: finalDescription,
      modelIds,
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || null,
      endTime: finalEndTime || null,
      recurrence: recurrence || 'none', // 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
      done: false,
      createdAt: new Date().toISOString(),
    };

    inMemoryTasks.unshift(newTask);

    return res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      task: newTask,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao criar tarefa: ${e.message}` });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    inMemoryTasks = inMemoryTasks.filter((t) => t.id !== id);
    return res.status(200).json({ message: 'Tarefa excluída de todos os modelos com sucesso.', id });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao excluir tarefa: ${e.message}` });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = inMemoryTasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    task.done = !task.done;
    return res.status(200).json({ message: 'Status da tarefa atualizado com sucesso.', task });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao atualizar tarefa: ${e.message}` });
  }
};

export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = inMemoryTasks.find((t) => t.id === id);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    task.done = true;
    return res.status(200).json({ message: 'Tarefa concluída com sucesso.', task });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao concluir tarefa: ${e.message}` });
  }
};
