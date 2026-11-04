import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Task } from '../models/taskModel.js';
import { Model } from '../models/modelModel.js';
import { TaskSchedule } from '../models/TaskTypes/taskScheduleModel.js';
import { TaskKanban } from '../models/TaskTypes/taskKanbanModel.js';
import { TaskMatrix } from '../models/TaskTypes/taskMatrixModel.js';
import { TaskHabit } from '../models/TaskTypes/taskHabitModel.js';
import { TaskRoutine } from '../models/TaskTypes/taskRoutineModel.js';
import { Subtask } from '../models/subtaskModel.js';
import { TaskCompletion } from '../models/taskCompletionModel.js';
import { isDatabaseConnected } from '../database/sequelize.js';
import { getUserTimezone, getTodayDateStr, matchesTargetDate } from '../utils/dateUtils.js';

export { matchesTargetDate };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'tasks_store.json');

// Garante que o diretório de dados para persistência em desenvolvimento exista
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (err) {
    console.warn('Aviso ao criar diretório de dados:', err.message);
  }
}

// Armazenamento em memória com persistência local em arquivo JSON (modo fallback)
let inMemoryTasks = [];
let inMemoryCompletions = [];

const loadLocalStore = () => {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.tasks)) inMemoryTasks = data.tasks;
      if (Array.isArray(data.completions)) inMemoryCompletions = data.completions;
      return;
    }
  } catch (err) {
    console.warn('Aviso ao carregar tasks_store.json:', err.message);
  }

  // Dados iniciais padrão de exemplo se o arquivo ainda não existir
  const todayStr = getTodayDateStr('America/Sao_Paulo');
  inMemoryTasks = [
    {
      id: 'task-init-1',
      id_account: 1,
      name: 'Revisar metas diárias',
      description: 'Planejar as prioridades do dia',
      modelId: 'routine',
      modelIds: ['routine'],
      date: todayStr,
      startTime: '09:00',
      endTime: '09:30',
      recurrence: 'daily',
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-init-2',
      id_account: 1,
      name: 'Sessão de foco profundo',
      description: 'Trabalhar no módulo principal do FocusMod',
      modelId: 'routine',
      modelIds: ['routine'],
      date: todayStr,
      startTime: '10:00',
      endTime: '11:00',
      recurrence: 'none',
      done: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-init-3',
      id_account: 1,
      name: 'Ideias de novos temas suaves',
      description: 'Testar variações de azul safira e fundo off-white',
      modelId: 'brain-dump',
      modelIds: ['brain-dump'],
      date: null,
      startTime: null,
      endTime: null,
      recurrence: 'none',
      done: false,
      createdAt: new Date().toISOString(),
    },
  ];
  saveLocalStore();
};

const saveLocalStore = () => {
  try {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        {
          tasks: inMemoryTasks,
          completions: inMemoryCompletions,
        },
        null,
        2
      ),
      'utf-8'
    );
  } catch (err) {
    console.warn('Aviso ao salvar tasks_store.json:', err.message);
  }
};

// Carrega store inicial
loadLocalStore();

// Normaliza o tipo/id do modelo
const extractModelType = (modelId) => {
  if (!modelId) return null;
  const str = String(modelId).toLowerCase();
  if (str.includes('daily') || str.includes('rotinas di') || str.includes('rotinas-di') || str.includes('daily-routine')) return 'daily-routines';
  if (str.includes('habit') || str.includes('hábito')) return 'habits';
  if (str.includes('routine') || str.includes('agenda')) return 'routine';
  if (str.includes('calendario') || str.includes('calendar')) return 'calendario';
  if (str.includes('brain')) return 'brain-dump';
  if (str.includes('pomodoro')) return 'pomodoro';
  if (str.includes('micro') || str.includes('subtask')) return 'microtasks';
  if (str.includes('kanban')) return 'kanban';
  if (str.includes('matrix') || str.includes('matriz') || str.includes('priority')) return 'priority-matrix';
  return str;
};

// Determina as datas concluídas e o status de conclusão de uma tarefa para uma data alvo
const resolveTaskDoneStatus = (task, targetDateStr, completions = []) => {
  const taskId = String(task.id_task || task.id);
  const taskCompletions = completions.filter(
    (c) => String(c.id_task) === taskId && Boolean(c.completed)
  );

  const completedDates = taskCompletions.map((c) => c.date);
  const isRecurrent = task.recurrence && task.recurrence !== 'none';
  const isHabit = Boolean(task.habit || task.modelId === 'habits');
  const isDailyRoutine = Boolean(task.dailyRoutine || task.modelId === 'daily-routines');

  let doneForTarget = false;
  if (isRecurrent || isHabit || isDailyRoutine) {
    if (targetDateStr) {
      doneForTarget = completedDates.includes(targetDateStr);
    } else {
      doneForTarget = false;
    }
  } else {
    if (targetDateStr && task.date === targetDateStr) {
      const match = taskCompletions.find((c) => c.date === targetDateStr);
      doneForTarget = match ? true : Boolean(task.done);
    } else {
      doneForTarget = Boolean(task.done);
    }
  }

  return {
    done: doneForTarget,
    completedDates,
  };
};

// Formata uma instância Sequelize de Task
const formatSequelizeTask = (t, customModelId = null, targetDateStr = null, dbCompletions = null) => {
  const resolvedModelId = customModelId || (t.model?.type ? t.model.type : String(t.id_model || 'routine'));
  const comps = dbCompletions !== null ? dbCompletions : (t.completions || []);
  const sched = t.schedule || {};
  const dateVal = sched.start_date || t.date || null;
  const startDateVal = sched.start_date || t.date || null;
  const endDateVal = sched.end_date || sched.start_date || t.date || null;
  const startTimeVal = sched.start_time || t.startTime || t.start_time || null;
  const endTimeVal = sched.end_time || t.endTime || t.end_time || null;
  const recurrenceVal = sched.recurrence || t.recurrence || 'none';

  const plainTask = {
    ...(t.get ? t.get({ plain: true }) : t),
    date: dateVal,
    recurrence: recurrenceVal,
  };
  const { done, completedDates } = resolveTaskDoneStatus(plainTask, targetDateStr, comps);

  const kanban = t.kanban ? {
    id_task_kanban: t.kanban.id_task_kanban,
    column_id: t.kanban.column_id || (t.done ? 'done' : 'todo'),
    order_index: t.kanban.order_index || 0,
  } : null;

  const matrix = t.matrix ? {
    id_task_matrix: t.matrix.id_task_matrix,
    urgency: Boolean(t.matrix.urgency),
    importance: Boolean(t.matrix.importance),
  } : null;

  const habit = t.habit ? {
    id_task_habit: t.habit.id_task_habit,
    frequency: t.habit.frequency || 'daily',
    target_days: t.habit.target_days || [0, 1, 2, 3, 4, 5, 6],
    color: t.habit.color || '#10b981',
  } : null;

  const dailyRoutine = t.dailyRoutine ? {
    id_task_routine: t.dailyRoutine.id_task_routine,
    period: t.dailyRoutine.period || 'morning',
    order_index: t.dailyRoutine.order_index || 0,
  } : null;

  const subtasks = Array.isArray(t.subtasks)
    ? t.subtasks.map((st) => ({
        id: String(st.id_subtask),
        id_subtask: st.id_subtask,
        id_task: st.id_task,
        title: st.title,
        done: Boolean(st.done),
        order_index: st.order_index || 0,
      })).sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
    : [];

  let effectiveDone = done;
  if (kanban) {
    if (kanban.column_id === 'done') {
      effectiveDone = true;
    } else if (effectiveDone && kanban.column_id !== 'done') {
      kanban.column_id = 'done';
    }
  }

  return {
    id: String(t.id_task),
    dbId: t.id_task,
    id_account: t.id_account,
    name: t.name,
    description: t.description || '',
    notes: t.description || '',
    modelId: resolvedModelId,
    modelIds: [resolvedModelId],
    date: dateVal,
    startDate: startDateVal,
    endDate: endDateVal,
    startTime: startTimeVal,
    endTime: endTimeVal,
    recurrence: recurrenceVal,
    done: effectiveDone,
    occurrenceDate: targetDateStr || dateVal,
    completedDates,
    kanban,
    matrix,
    habit,
    dailyRoutine,
    subtasks,
    schedule: (sched.id_task_schedule || sched.start_date) ? {
      id_task_schedule: sched.id_task_schedule || null,
      start_date: startDateVal,
      end_date: endDateVal,
      start_time: startTimeVal,
      end_time: endTimeVal,
      recurrence: recurrenceVal,
    } : null,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
  };
};

// Formata uma tarefa do fallback em memória
const formatInMemoryTask = (t, customModelId = null, targetDateStr = null) => {
  const resolvedModelId = customModelId || t.modelId || (Array.isArray(t.modelIds) && t.modelIds[0]) || 'routine';
  const { done, completedDates } = resolveTaskDoneStatus(t, targetDateStr, inMemoryCompletions);

  let effectiveDone = done;
  let kanban = t.kanban ? { ...t.kanban } : null;
  if (kanban) {
    if (kanban.column_id === 'done') effectiveDone = true;
    else if (effectiveDone) kanban.column_id = 'done';
  }

  return {
    ...t,
    id: String(t.id),
    modelId: resolvedModelId,
    modelIds: [resolvedModelId],
    done: effectiveDone,
    occurrenceDate: targetDateStr || t.date || null,
    completedDates,
    kanban,
    matrix: t.matrix || null,
    habit: t.habit || null,
    dailyRoutine: t.dailyRoutine || null,
    subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
  };
};

export const getTasks = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { modelId, modelType, targetDate, today } = req.query;
    const userTz = getUserTimezone(req);
    const todayStr = today || getTodayDateStr(userTz);
    const viewDateStr = targetDate || todayStr;

    // Se o banco PostgreSQL estiver configurado e conectado
    if (await isDatabaseConnected()) {
      const typeKey = extractModelType(modelType || modelId);
      let whereClause = {
        id_account: userId,
      };

      if (typeKey) {
        const [matchingModel] = await Model.findOrCreate({ where: { type: typeKey }, defaults: { name: typeKey, type: typeKey } });
        if (matchingModel) {
          whereClause.id_model = matchingModel.id_model;
        }
      } else if (modelId && !isNaN(Number(modelId))) {
        whereClause.id_model = Number(modelId);
      }

      const tasksFromDb = await Task.findAll({
        where: whereClause,
        include: [
          { model: Model, as: 'model', required: false },
          { model: TaskSchedule, as: 'schedule', required: false },
          { model: TaskKanban, as: 'kanban', required: false },
          { model: TaskMatrix, as: 'matrix', required: false },
          { model: TaskHabit, as: 'habit', required: false },
          { model: TaskRoutine, as: 'dailyRoutine', required: false },
          { model: Subtask, as: 'subtasks', required: false },
          { model: TaskCompletion, as: 'completions', required: false },
        ],
        order: [['createdAt', 'DESC']],
      });

      let formatted = tasksFromDb.map((t) =>
        formatSequelizeTask(t, modelId, targetDate ? viewDateStr : null, t.completions)
      );

      const isRoutine =
        modelId === 'routine' ||
        modelType === 'routine' ||
        (typeof modelId === 'string' && modelId.includes('routine') && !modelId.includes('daily'));

      if (isRoutine) {
        const isViewingToday = viewDateStr === todayStr;
        formatted = formatted
          .map((task) => {
            const isFromTargetDate = matchesTargetDate(task, viewDateStr);
            // Tarefa vencida se aplica apenas a tarefas NÃO recorrentes com data anterior a hoje
            const isRecurrent = task.recurrence && task.recurrence !== 'none';
            const isOverdue = Boolean(
              !isRecurrent && isViewingToday && task.date && task.date < todayStr && !task.done
            );

            return {
              ...task,
              isOverdue,
              isFromTargetDate,
            };
          })
          .filter((task) => task.isFromTargetDate || task.isOverdue);
      }

      return res.status(200).json({ tasks: formatted });
    }

    // Fallback em memória
    let filtered = inMemoryTasks.filter((t) => (t.id_account || 1) === userId);

    if (modelId) {
      filtered = filtered.filter((t) => {
        if (t.modelId === modelId || extractModelType(t.modelId) === extractModelType(modelType || modelId)) return true;
        if (Array.isArray(t.modelIds) && t.modelIds.includes(modelId)) return true;

        if (modelId === 'routine' && (t.modelId === 'routine' || (t.modelId?.includes('routine') && !t.modelId?.includes('daily')) || t.modelIds?.includes('routine'))) return true;
        if (modelId === 'calendario' && (t.modelId === 'calendario' || t.modelId?.includes('calendario') || t.modelIds?.includes('calendario'))) return true;
        if (modelId === 'brain-dump' && (t.modelId === 'brain-dump' || t.modelId?.includes('brain') || t.modelIds?.includes('brain-dump'))) return true;
        if (modelId === 'microtasks' && (t.modelId === 'microtasks' || t.modelId?.includes('micro') || t.modelIds?.includes('microtasks'))) return true;
        if (modelId === 'kanban' && (t.modelId === 'kanban' || t.modelId?.includes('kanban') || t.modelIds?.includes('kanban'))) return true;
        if (modelId === 'priority-matrix' && (t.modelId === 'priority-matrix' || t.modelId?.includes('matrix') || t.modelId?.includes('priority') || t.modelIds?.includes('priority-matrix'))) return true;
        if (modelId === 'habits' && (t.modelId === 'habits' || t.modelId?.includes('habit') || t.modelIds?.includes('habits'))) return true;
        if (modelId === 'daily-routines' && (t.modelId === 'daily-routines' || t.modelId?.includes('daily') || t.modelId?.includes('rotina') || t.modelIds?.includes('daily-routines'))) return true;

        return false;
      });
    }

    let formatted = filtered.map((t) =>
      formatInMemoryTask(t, modelId, targetDate ? viewDateStr : null)
    );

    const isRoutine =
      modelId === 'routine' ||
      modelType === 'routine' ||
      (typeof modelId === 'string' && modelId.includes('routine') && !modelId.includes('daily'));

    if (isRoutine) {
      const isViewingToday = viewDateStr === todayStr;

      formatted = formatted
        .map((task) => {
          const isFromTargetDate = matchesTargetDate(task, viewDateStr);
          const isRecurrent = task.recurrence && task.recurrence !== 'none';
          const isOverdue = Boolean(
            !isRecurrent && isViewingToday && task.date && task.date < todayStr && !task.done
          );

          return {
            ...task,
            isOverdue,
            isFromTargetDate,
          };
        })
        .filter((task) => task.isFromTargetDate || task.isOverdue);
    }

    return res.status(200).json({ tasks: formatted });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao buscar tarefas: ${e.message}` });
  }
};

export const getTodayCounts = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const userTz = getUserTimezone(req);
    const todayStr = req.query.today || getTodayDateStr(userTz);
    const counts = {};

    if (await isDatabaseConnected()) {
      const allTasks = await Task.findAll({
        where: { id_account: userId },
        include: [
          { model: Model, as: 'model', required: false },
          { model: TaskCompletion, as: 'completions', required: false },
        ],
      });

      allTasks.forEach((t) => {
        const isRecurrent = t.recurrence && t.recurrence !== 'none';
        const { done } = resolveTaskDoneStatus(t, todayStr, t.completions);

        // Se concluída para hoje, não entra na contagem de pendências
        if (done) return;

        const isForToday = matchesTargetDate(t, todayStr);
        const isOverdue = Boolean(!isRecurrent && t.date && t.date < todayStr && !t.done);
        const targetModelId = t.model?.type || extractModelType(t.id_model);

        if (!targetModelId) return;

        if (targetModelId === 'routine' || (targetModelId.includes('routine') && !targetModelId.includes('daily'))) {
          if (isForToday || isOverdue) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'calendario' || targetModelId.includes('calendario')) {
          if (isForToday) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'brain-dump' || targetModelId.includes('brain')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'microtasks' || targetModelId.includes('micro')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'kanban' || targetModelId.includes('kanban')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'priority-matrix' || targetModelId.includes('matrix') || targetModelId.includes('priority')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'habits' || targetModelId.includes('habit')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'daily-routines' || targetModelId.includes('daily') || targetModelId.includes('rotina')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        }
      });

      return res.status(200).json({ today: todayStr, counts });
    }

    // Fallback em memória
    inMemoryTasks
      .filter((t) => (t.id_account || 1) === userId)
      .forEach((task) => {
        const isRecurrent = task.recurrence && task.recurrence !== 'none';
        const { done } = resolveTaskDoneStatus(task, todayStr, inMemoryCompletions);

        if (done) return;

        const isForToday = matchesTargetDate(task, todayStr);
        const isOverdue = Boolean(!isRecurrent && task.date && task.date < todayStr && !task.done);
        const targetModelId = task.modelId || (Array.isArray(task.modelIds) && task.modelIds[0]);

        if (!targetModelId) return;

        if (targetModelId === 'routine' || (targetModelId.includes('routine') && !targetModelId.includes('daily'))) {
          if (isForToday || isOverdue) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'calendario' || targetModelId.includes('calendario')) {
          if (isForToday) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'brain-dump' || targetModelId.includes('brain')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'microtasks' || targetModelId.includes('micro')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'kanban' || targetModelId.includes('kanban')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'priority-matrix' || targetModelId.includes('matrix')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'habits' || targetModelId.includes('habit')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        } else if (targetModelId === 'daily-routines' || targetModelId.includes('daily') || targetModelId.includes('rotina')) {
          counts[targetModelId] = (counts[targetModelId] || 0) + 1;
        }
      });

    return res.status(200).json({ today: todayStr, counts });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao obter contagens de hoje: ${e.message}` });
  }
};

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
    const userId = req.user?.id || 1;
    const {
      name,
      description = '',
      notes = '',
      modelId,
      modelIds,
      date,
      startTime,
      endTime,
      recurrence = 'none',
      column_id,
      urgency,
      importance,
      subtasks,
      frequency,
      target_days,
      color,
      period,
      order_index,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'O nome da tarefa é obrigatório.' });
    }

    const finalModelId = modelId || (Array.isArray(modelIds) && modelIds[0]) || null;

    if (!finalModelId) {
      return res.status(400).json({ message: 'Selecione o modelo ao qual a tarefa pertence.' });
    }

    let finalEndTime = endTime || null;
    if (startTime && endTime && startTime >= endTime) {
      finalEndTime = addMinutesToTime(startTime, 1);
    }

    const isRoutine =
      finalModelId === 'routine' ||
      finalModelId === 'agenda-visual' ||
      (typeof finalModelId === 'string' && finalModelId.includes('routine') && !finalModelId.includes('daily'));

    const isCalendar =
      finalModelId === 'calendario' ||
      (typeof finalModelId === 'string' && finalModelId.includes('calendario'));

    const isKanban =
      finalModelId === 'kanban' ||
      (typeof finalModelId === 'string' && finalModelId.includes('kanban')) ||
      false;

    const isMatrix =
      finalModelId === 'priority-matrix' ||
      (typeof finalModelId === 'string' && (finalModelId.includes('matrix') || finalModelId.includes('priority'))) ||
      false ||
      false;

    const isHabit =
      finalModelId === 'habits' ||
      (typeof finalModelId === 'string' && finalModelId.includes('habit')) ||
      false;

    const isDailyRoutine =
      finalModelId === 'daily-routines' ||
      (typeof finalModelId === 'string' && (finalModelId.includes('daily') || finalModelId.includes('rotina'))) ||
      false;

    if (isRoutine && !startTime) {
      return res.status(400).json({
        message: 'O horário de início é obrigatório quando a Agenda Visual está selecionada.',
      });
    }

    if ((isCalendar || isRoutine) && !date) {
      return res.status(400).json({ message: 'A data é obrigatória para o modelo selecionado.' });
    }

    const finalDescription = (description || notes || '').trim();
    const targetCol = isKanban ? (column_id || 'todo') : null;
    const initialDone = Boolean(isKanban && targetCol === 'done');

    // Se o banco PostgreSQL estiver configurado e conectado
    if (await isDatabaseConnected()) {
      const typeKey = extractModelType(finalModelId);
      let targetIdModel = null;

      if (typeKey) {
        const [foundModel] = await Model.findOrCreate({ where: { type: typeKey }, defaults: { name: typeKey, type: typeKey } });
        if (foundModel) {
          targetIdModel = foundModel.id_model;
        }
      } else if (!isNaN(Number(finalModelId))) {
        targetIdModel = Number(finalModelId);
      }

      const userTz = getUserTimezone(req);
      const defaultDate = getTodayDateStr(userTz);
      const created = await Task.create({
        id_account: userId,
        id_model: targetIdModel,
        name: name.trim(),
        description: finalDescription,
        done: initialDone,
      });

      let createdSchedule = null;
      const hasSchedule = Boolean(isCalendar || isRoutine || date || startTime || (recurrence && recurrence !== 'none'));
      if (hasSchedule) {
        try {
          const scheduleStartDate = date || defaultDate;
          const scheduleEndDate = req.body?.endDate || scheduleStartDate;
          createdSchedule = await TaskSchedule.create({
            id_task: created.id_task,
            start_date: scheduleStartDate,
            end_date: scheduleEndDate,
            start_time: startTime || null,
            end_time: finalEndTime || null,
            recurrence: recurrence || 'none',
          });
        } catch (calErr) {
          console.warn('Nota ao registrar TaskSchedule:', calErr.message);
        }
      }
      created.schedule = createdSchedule;

      // Extensão Kanban
      if (isKanban) {
        try {
          const createdKanban = await TaskKanban.create({
            id_task: created.id_task,
            column_id: targetCol,
            order_index: 0,
          });
          created.kanban = createdKanban;
        } catch (kErr) {
          console.warn('Nota ao registrar TaskKanban:', kErr.message);
        }
      }

      // Extensão Matriz de Prioridades
      if (isMatrix) {
        try {
          const createdMatrix = await TaskMatrix.create({
            id_task: created.id_task,
            urgency: urgency !== undefined ? Boolean(urgency) : true,
            importance: importance !== undefined ? Boolean(importance) : true,
          });
          created.matrix = createdMatrix;
        } catch (mErr) {
          console.warn('Nota ao registrar TaskMatrix:', mErr.message);
        }
      }

      // Extensão Rastreador de Hábitos
      if (isHabit) {
        try {
          const createdHabit = await TaskHabit.create({
            id_task: created.id_task,
            frequency: frequency || 'daily',
            target_days: Array.isArray(target_days) ? target_days : [0, 1, 2, 3, 4, 5, 6],
            color: color || '#10b981',
          });
          created.habit = createdHabit;
        } catch (hErr) {
          console.warn('Nota ao registrar TaskHabit:', hErr.message);
        }
      }

      // Extensão Rotinas Diárias
      if (isDailyRoutine) {
        try {
          const createdRoutine = await TaskRoutine.create({
            id_task: created.id_task,
            period: period || 'morning',
            order_index: typeof order_index === 'number' ? order_index : 0,
          });
          created.dailyRoutine = createdRoutine;
        } catch (rErr) {
          console.warn('Nota ao registrar TaskRoutine:', rErr.message);
        }
      }

      // Subtarefas iniciais
      created.subtasks = [];
      if (Array.isArray(subtasks) && subtasks.length > 0) {
        for (let i = 0; i < subtasks.length; i++) {
          const stTitle = typeof subtasks[i] === 'string' ? subtasks[i] : subtasks[i]?.title;
          if (stTitle && stTitle.trim()) {
            try {
              const createdSt = await Subtask.create({
                id_task: created.id_task,
                title: stTitle.trim(),
                done: Boolean(subtasks[i]?.done),
                order_index: i,
              });
              created.subtasks.push(createdSt);
            } catch (stErr) {
              console.warn('Nota ao registrar Subtask:', stErr.message);
            }
          }
        }
      }

      const formatted = formatSequelizeTask(created, finalModelId, date, []);

      return res.status(201).json({
        message: 'Tarefa criada com sucesso!',
        task: formatted,
      });
    }

    // Fallback em memória
    const userTz = getUserTimezone(req);
    const defaultDate = getTodayDateStr(userTz);

    const memorySubtasks = (Array.isArray(subtasks) ? subtasks : [])
      .map((st, i) => {
        const title = typeof st === 'string' ? st : st?.title;
        if (!title || !title.trim()) return null;
        return {
          id: `subtask-${Date.now()}-${i}`,
          id_subtask: Date.now() + i,
          title: title.trim(),
          done: Boolean(st.done),
          order_index: i,
        };
      })
      .filter(Boolean);

    const newTask = {
      id: `task-${Date.now()}`,
      id_account: userId,
      name: name.trim(),
      description: finalDescription,
      notes: finalDescription,
      modelId: finalModelId,
      modelIds: [finalModelId],
      date: (isCalendar || isRoutine) ? (date || defaultDate) : null,
      startTime: isRoutine ? (startTime || null) : (isCalendar ? (startTime || null) : null),
      endTime: isRoutine ? (finalEndTime || null) : (isCalendar ? (finalEndTime || null) : null),
      recurrence: (isCalendar || isRoutine) ? (recurrence || 'none') : 'none',
      done: initialDone,
      kanban: isKanban ? { column_id: targetCol, order_index: 0 } : null,
      matrix: isMatrix ? {
        urgency: urgency !== undefined ? Boolean(urgency) : true,
        importance: importance !== undefined ? Boolean(importance) : true,
      } : null,
      habit: isHabit ? {
        frequency: frequency || 'daily',
        target_days: Array.isArray(target_days) ? target_days : [0, 1, 2, 3, 4, 5, 6],
        color: color || '#10b981',
      } : null,
      dailyRoutine: isDailyRoutine ? {
        period: period || 'morning',
        order_index: typeof order_index === 'number' ? order_index : 0,
      } : null,
      subtasks: memorySubtasks,
      createdAt: new Date().toISOString(),
    };

    inMemoryTasks.unshift(newTask);
    saveLocalStore();

    const formatted = formatInMemoryTask(newTask, finalModelId, date);

    return res.status(201).json({
      message: 'Tarefa criada com sucesso!',
      task: formatted,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao criar tarefa: ${e.message}` });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;

    if (await isDatabaseConnected()) {
      const numId = Number(id);
      if (!isNaN(numId)) {
        await TaskSchedule.destroy({ where: { id_task: numId } }).catch(() => {});
        await TaskCompletion.destroy({ where: { id_task: numId, id_account: userId } }).catch(() => {});
        await TaskKanban.destroy({ where: { id_task: numId } }).catch(() => {});
        await TaskMatrix.destroy({ where: { id_task: numId } }).catch(() => {});
        await TaskHabit.destroy({ where: { id_task: numId } }).catch(() => {});
        await TaskRoutine.destroy({ where: { id_task: numId } }).catch(() => {});
        await Subtask.destroy({ where: { id_task: numId } }).catch(() => {});
        await Task.destroy({ where: { id_task: numId, id_account: userId } });
        return res.status(200).json({ message: 'Tarefa excluída com sucesso.', id });
      }
    }

    inMemoryTasks = inMemoryTasks.filter((t) => !(t.id === id && (t.id_account || 1) === userId));
    inMemoryCompletions = inMemoryCompletions.filter(
      (c) => !(String(c.id_task) === id && (c.id_account || 1) === userId)
    );
    saveLocalStore();

    return res.status(200).json({ message: 'Tarefa excluída com sucesso.', id });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao excluir tarefa: ${e.message}` });
  }
};

/**
 * Atualiza propriedades da tarefa ou seu status de conclusão (PUT/PATCH /api/tasks/:id)
 * Trata tarefas recorrentes registrando a conclusão por data/ocorrência,
 * sem afetar as demais ocorrências e mantendo a recorrência ativa!
 */
export const updateTask = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    const {
      name,
      description,
      notes,
      modelId,
      date,
      startTime,
      endTime,
      recurrence,
      done,
      column_id,
      urgency,
      importance,
      frequency,
      target_days,
      color,
      period,
      order_index,
    } = req.body;

    const userTz = getUserTimezone(req);
    const todayStr = req.body?.today || req.query?.today || getTodayDateStr(userTz);
    const occurrenceDate = date || req.query.date || todayStr;

    // Modo Banco de Dados
    if (await isDatabaseConnected()) {
      const numId = Number(id);
      if (isNaN(numId)) {
        return res.status(400).json({ message: 'ID de tarefa inválido.' });
      }

      const taskRecord = await Task.findOne({
        where: { id_task: numId, id_account: userId },
        include: [
          { model: Model, as: 'model', required: false },
          { model: TaskSchedule, as: 'schedule', required: false },
          { model: TaskCompletion, as: 'completions', required: false },
          { model: TaskKanban, as: 'kanban', required: false },
          { model: TaskMatrix, as: 'matrix', required: false },
          { model: TaskHabit, as: 'habit', required: false },
          { model: TaskRoutine, as: 'dailyRoutine', required: false },
          { model: Subtask, as: 'subtasks', required: false },
        ],
      });

      if (!taskRecord) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      const updates = {};
      if (name !== undefined) updates.name = name.trim();
      if (description !== undefined || notes !== undefined) {
        updates.description = (description !== undefined ? description : notes).trim();
      }

      if (modelId) {
        const typeKey = extractModelType(modelId);
        if (typeKey) {
          const [foundModel] = await Model.findOrCreate({ where: { type: typeKey }, defaults: { name: typeKey, type: typeKey } });
          if (foundModel) updates.id_model = foundModel.id_model;
        } else if (!isNaN(Number(modelId))) {
          updates.id_model = Number(modelId);
        }
      }

      // Atualização de agendamento em TaskSchedule
      const hasScheduleUpdates = Boolean(
        date !== undefined ||
        startTime !== undefined ||
        endTime !== undefined ||
        recurrence !== undefined
      );

      let currentSchedule = taskRecord.schedule;
      if (hasScheduleUpdates) {
        if (!currentSchedule) {
          currentSchedule = await TaskSchedule.findOne({ where: { id_task: numId } });
        }
        const schedData = {};
        if (date !== undefined) {
          schedData.start_date = date || null;
          schedData.end_date = req.body?.endDate || date || null;
        }
        if (startTime !== undefined) schedData.start_time = startTime || null;
        if (endTime !== undefined) schedData.end_time = endTime || null;
        if (recurrence !== undefined) schedData.recurrence = recurrence;

        if (currentSchedule) {
          await currentSchedule.update(schedData);
        } else if (schedData.start_date) {
          currentSchedule = await TaskSchedule.create({
            id_task: numId,
            start_date: schedData.start_date,
            end_date: schedData.end_date || schedData.start_date,
            start_time: schedData.start_time || null,
            end_time: schedData.end_time || null,
            recurrence: schedData.recurrence || 'none',
          });
        }
        taskRecord.schedule = currentSchedule;
      }

      const activeRecurrence = currentSchedule?.recurrence || recurrence || 'none';
      const isRecurrent = activeRecurrence && activeRecurrence !== 'none';
      const isHabit = Boolean(taskRecord.habit || taskRecord.model?.type === 'habits' || frequency !== undefined);
      const isDailyRoutine = Boolean(taskRecord.dailyRoutine || taskRecord.model?.type === 'daily-routines' || period !== undefined);
      const isDailyOccurrence = isRecurrent || isHabit || isDailyRoutine;

      // Sincronização com Kanban
      let effectiveDone = done;
      if (column_id !== undefined) {
        if (taskRecord.kanban) {
          await taskRecord.kanban.update({ column_id });
        } else {
          taskRecord.kanban = await TaskKanban.create({
            id_task: numId,
            column_id,
            order_index: 0,
          });
        }

        if (column_id === 'done') {
          effectiveDone = true;
        } else if (effectiveDone === undefined) {
          effectiveDone = false;
        }
      }

      // Sincronização com Matriz
      if (urgency !== undefined || importance !== undefined) {
        const matUpdates = {};
        if (urgency !== undefined) matUpdates.urgency = Boolean(urgency);
        if (importance !== undefined) matUpdates.importance = Boolean(importance);

        if (taskRecord.matrix) {
          await taskRecord.matrix.update(matUpdates);
        } else {
          taskRecord.matrix = await TaskMatrix.create({
            id_task: numId,
            urgency: urgency !== undefined ? Boolean(urgency) : true,
            importance: importance !== undefined ? Boolean(importance) : true,
          });
        }
      }

      // Sincronização com Habit
      if (frequency !== undefined || target_days !== undefined || color !== undefined) {
        const habitUpdates = {};
        if (frequency !== undefined) habitUpdates.frequency = frequency;
        if (target_days !== undefined) habitUpdates.target_days = target_days;
        if (color !== undefined) habitUpdates.color = color;

        if (taskRecord.habit) {
          await taskRecord.habit.update(habitUpdates);
        } else {
          taskRecord.habit = await TaskHabit.create({
            id_task: numId,
            frequency: frequency || 'daily',
            target_days: Array.isArray(target_days) ? target_days : [0, 1, 2, 3, 4, 5, 6],
            color: color || '#10b981',
          });
        }
      }

      // Sincronização com DailyRoutine
      if (period !== undefined || order_index !== undefined) {
        const routineUpdates = {};
        if (period !== undefined) routineUpdates.period = period;
        if (order_index !== undefined) routineUpdates.order_index = order_index;

        if (taskRecord.dailyRoutine) {
          await taskRecord.dailyRoutine.update(routineUpdates);
        } else {
          taskRecord.dailyRoutine = await TaskRoutine.create({
            id_task: numId,
            period: period || 'morning',
            order_index: typeof order_index === 'number' ? order_index : 0,
          });
        }
      }

      // Tratamento de conclusão
      if (effectiveDone !== undefined) {
        const targetDone = Boolean(effectiveDone);

        // Se Kanban existe e done foi alterado sem passar column_id
        if (column_id === undefined && taskRecord.kanban) {
          if (targetDone) {
            await taskRecord.kanban.update({ column_id: 'done' });
          } else if (taskRecord.kanban.column_id === 'done') {
            await taskRecord.kanban.update({ column_id: 'todo' });
          }
        }

        if (isDailyOccurrence) {
          const existingComp = await TaskCompletion.findOne({
            where: {
              id_task: numId,
              id_account: userId,
              date: occurrenceDate,
            },
          });

          if (existingComp) {
            await existingComp.update({ completed: targetDone });
          } else {
            await TaskCompletion.create({
              id_task: numId,
              id_account: userId,
              date: occurrenceDate,
              completed: targetDone,
            });
          }
        } else {
          updates.done = targetDone;
          if (occurrenceDate) {
            const existingComp = await TaskCompletion.findOne({
              where: {
                id_task: numId,
                id_account: userId,
                date: occurrenceDate,
              },
            });
            if (existingComp) {
              await existingComp.update({ completed: targetDone });
            } else {
              await TaskCompletion.create({
                id_task: numId,
                id_account: userId,
                date: occurrenceDate,
                completed: targetDone,
              });
            }
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        await taskRecord.update(updates);
      }

      // Recarrega registros atualizados
      const freshCompletions = await TaskCompletion.findAll({
        where: { id_task: numId, id_account: userId },
      });
      const freshKanban = await TaskKanban.findOne({ where: { id_task: numId } });
      const freshMatrix = await TaskMatrix.findOne({ where: { id_task: numId } });
      const freshHabit = await TaskHabit.findOne({ where: { id_task: numId } });
      const freshRoutine = await TaskRoutine.findOne({ where: { id_task: numId } });
      const freshSubtasks = await Subtask.findAll({ where: { id_task: numId }, order: [['order_index', 'ASC']] });

      taskRecord.kanban = freshKanban;
      taskRecord.matrix = freshMatrix;
      taskRecord.habit = freshHabit;
      taskRecord.dailyRoutine = freshRoutine;
      taskRecord.subtasks = freshSubtasks;

      const formatted = formatSequelizeTask(
        taskRecord,
        null,
        occurrenceDate,
        freshCompletions
      );

      return res.status(200).json({
        message: 'Tarefa atualizada com sucesso.',
        task: formatted,
      });
    }

    // Modo Fallback em Memória
    const task = inMemoryTasks.find((t) => t.id === id && (t.id_account || 1) === userId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    if (name !== undefined) task.name = name.trim();
    if (description !== undefined || notes !== undefined) {
      task.description = (description !== undefined ? description : notes).trim();
      task.notes = task.description;
    }
    if (modelId) {
      task.modelId = modelId;
      task.modelIds = [modelId];
    }
    if (startTime !== undefined) task.startTime = startTime || null;
    if (endTime !== undefined) task.endTime = endTime || null;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (date !== undefined && task.recurrence === 'none') task.date = date || null;

    let effectiveDone = done;
    if (column_id !== undefined) {
      task.kanban = task.kanban || { order_index: 0 };
      task.kanban.column_id = column_id;
      if (column_id === 'done') {
        effectiveDone = true;
      } else if (effectiveDone === undefined) {
        effectiveDone = false;
      }
    }

    if (urgency !== undefined || importance !== undefined) {
      task.matrix = task.matrix || { urgency: true, importance: true };
      if (urgency !== undefined) task.matrix.urgency = Boolean(urgency);
      if (importance !== undefined) task.matrix.importance = Boolean(importance);
    }

    if (frequency !== undefined || target_days !== undefined || color !== undefined) {
      task.habit = task.habit || { frequency: 'daily', target_days: [0, 1, 2, 3, 4, 5, 6], color: '#10b981' };
      if (frequency !== undefined) task.habit.frequency = frequency;
      if (target_days !== undefined) task.habit.target_days = target_days;
      if (color !== undefined) task.habit.color = color;
    }

    if (period !== undefined || order_index !== undefined) {
      task.dailyRoutine = task.dailyRoutine || { period: 'morning', order_index: 0 };
      if (period !== undefined) task.dailyRoutine.period = period;
      if (order_index !== undefined) task.dailyRoutine.order_index = order_index;
    }

    const isRecurrent = task.recurrence && task.recurrence !== 'none';
    const isHabit = Boolean(task.habit || task.modelId === 'habits');
    const isDailyRoutine = Boolean(task.dailyRoutine || task.modelId === 'daily-routines');
    const isDailyOccurrence = isRecurrent || isHabit || isDailyRoutine;

    if (effectiveDone !== undefined) {
      const targetDone = Boolean(effectiveDone);

      if (column_id === undefined && task.kanban) {
        if (targetDone) {
          task.kanban.column_id = 'done';
        } else if (task.kanban.column_id === 'done') {
          task.kanban.column_id = 'todo';
        }
      }

      if (isDailyOccurrence) {
        const existingIdx = inMemoryCompletions.findIndex(
          (c) => String(c.id_task) === String(id) && c.date === occurrenceDate
        );
        if (existingIdx >= 0) {
          inMemoryCompletions[existingIdx].completed = targetDone;
        } else {
          inMemoryCompletions.push({
            id_completion: Date.now(),
            id_task: id,
            id_account: userId,
            date: occurrenceDate,
            completed: targetDone,
            createdAt: new Date(),
          });
        }
      } else {
        task.done = targetDone;
        const existingIdx = inMemoryCompletions.findIndex(
          (c) => String(c.id_task) === String(id) && c.date === occurrenceDate
        );
        if (existingIdx >= 0) {
          inMemoryCompletions[existingIdx].completed = targetDone;
        } else if (occurrenceDate) {
          inMemoryCompletions.push({
            id_completion: Date.now(),
            id_task: id,
            id_account: userId,
            date: occurrenceDate,
            completed: targetDone,
            createdAt: new Date(),
          });
        }
      }
    }

    saveLocalStore();

    const formatted = formatInMemoryTask(task, null, occurrenceDate);

    return res.status(200).json({
      message: 'Tarefa atualizada com sucesso.',
      task: formatted,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao atualizar tarefa: ${e.message}` });
  }
};

/**
 * Alterna o status da tarefa (concluída / pendente)
 */
export const toggleTask = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    const userTz = getUserTimezone(req);
    const targetDate = req.body?.date || req.query?.date || getTodayDateStr(userTz);

    if (await isDatabaseConnected()) {
      const numId = Number(id);
      if (isNaN(numId)) {
        return res.status(400).json({ message: 'ID de tarefa inválido.' });
      }

      const taskRecord = await Task.findOne({
        where: { id_task: numId, id_account: userId },
        include: [
          { model: TaskCompletion, as: 'completions', required: false },
          { model: TaskKanban, as: 'kanban', required: false },
          { model: TaskMatrix, as: 'matrix', required: false },
          { model: TaskHabit, as: 'habit', required: false },
          { model: TaskRoutine, as: 'dailyRoutine', required: false },
          { model: Subtask, as: 'subtasks', required: false },
        ],
      });

      if (!taskRecord) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      const isRecurrent = taskRecord.recurrence && taskRecord.recurrence !== 'none';
      const isHabit = Boolean(taskRecord.habit);
      const isDailyRoutine = Boolean(taskRecord.dailyRoutine);
      const isDailyOccurrence = isRecurrent || isHabit || isDailyRoutine;
      let newDoneState = false;

      if (isDailyOccurrence) {
        const existingComp = await TaskCompletion.findOne({
          where: {
            id_task: numId,
            id_account: userId,
            date: targetDate,
          },
        });

        newDoneState = existingComp ? !existingComp.completed : true;

        if (existingComp) {
          await existingComp.update({ completed: newDoneState });
        } else {
          await TaskCompletion.create({
            id_task: numId,
            id_account: userId,
            date: targetDate,
            completed: newDoneState,
          });
        }
      } else {
        newDoneState = req.body?.done !== undefined ? Boolean(req.body.done) : !taskRecord.done;
        await taskRecord.update({ done: newDoneState });

        const existingComp = await TaskCompletion.findOne({
          where: {
            id_task: numId,
            id_account: userId,
            date: targetDate,
          },
        });
        if (existingComp) {
          await existingComp.update({ completed: newDoneState });
        } else {
          await TaskCompletion.create({
            id_task: numId,
            id_account: userId,
            date: targetDate,
            completed: newDoneState,
          });
        }
      }

      // Sincroniza kanban
      if (taskRecord.kanban) {
        if (newDoneState) {
          await taskRecord.kanban.update({ column_id: 'done' });
        } else if (taskRecord.kanban.column_id === 'done') {
          await taskRecord.kanban.update({ column_id: 'todo' });
        }
      }

      const freshCompletions = await TaskCompletion.findAll({
        where: { id_task: numId, id_account: userId },
      });
      const freshKanban = await TaskKanban.findOne({ where: { id_task: numId } });
      const freshMatrix = await TaskMatrix.findOne({ where: { id_task: numId } });
      const freshHabit = await TaskHabit.findOne({ where: { id_task: numId } });
      const freshRoutine = await TaskRoutine.findOne({ where: { id_task: numId } });

      taskRecord.kanban = freshKanban;
      taskRecord.matrix = freshMatrix;
      taskRecord.habit = freshHabit;
      taskRecord.dailyRoutine = freshRoutine;

      const formatted = formatSequelizeTask(taskRecord, null, targetDate, freshCompletions);

      return res.status(200).json({
        message: 'Status da tarefa atualizado com sucesso.',
        task: formatted,
      });
    }

    // Fallback em memória
    const task = inMemoryTasks.find((t) => t.id === id && (t.id_account || 1) === userId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    const isRecurrent = task.recurrence && task.recurrence !== 'none';
    const isHabit = Boolean(task.habit || task.modelId === 'habits');
    const isDailyRoutine = Boolean(task.dailyRoutine || task.modelId === 'daily-routines');
    const isDailyOccurrence = isRecurrent || isHabit || isDailyRoutine;
    let newDoneState = false;

    if (isDailyOccurrence) {
      const existingIdx = inMemoryCompletions.findIndex(
        (c) => String(c.id_task) === String(id) && c.date === targetDate
      );
      if (existingIdx >= 0) {
        newDoneState = !inMemoryCompletions[existingIdx].completed;
        inMemoryCompletions[existingIdx].completed = newDoneState;
      } else {
        newDoneState = true;
        inMemoryCompletions.push({
          id_completion: Date.now(),
          id_task: id,
          id_account: userId,
          date: targetDate,
          completed: true,
          createdAt: new Date(),
        });
      }
    } else {
      newDoneState = req.body?.done !== undefined ? Boolean(req.body.done) : !task.done;
      task.done = newDoneState;

      const existingIdx = inMemoryCompletions.findIndex(
        (c) => String(c.id_task) === String(id) && c.date === targetDate
      );
      if (existingIdx >= 0) {
        inMemoryCompletions[existingIdx].completed = newDoneState;
      } else {
        inMemoryCompletions.push({
          id_completion: Date.now(),
          id_task: id,
          id_account: userId,
          date: targetDate,
          completed: newDoneState,
          createdAt: new Date(),
        });
      }
    }

    // Sincroniza kanban
    if (task.kanban) {
      if (newDoneState) {
        task.kanban.column_id = 'done';
      } else if (task.kanban.column_id === 'done') {
        task.kanban.column_id = 'todo';
      }
    }

    saveLocalStore();

    const formatted = formatInMemoryTask(task, null, targetDate);

    return res.status(200).json({
      message: 'Status da tarefa atualizado com sucesso.',
      task: formatted,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao alternar status da tarefa: ${e.message}` });
  }
};

/**
 * Marca como concluída (true)
 */
export const completeTask = async (req, res) => {
  req.body = { ...req.body, done: true };
  return updateTask(req, res);
};

/**
 * Criação de subtarefa individual (POST /api/tasks/:id/subtasks)
 */
export const createSubtask = async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'O título da subtarefa é obrigatório.' });
    }

    if (await isDatabaseConnected()) {
      const numId = Number(id);
      if (isNaN(numId)) {
        return res.status(400).json({ message: 'ID de tarefa inválido.' });
      }
      const taskRecord = await Task.findOne({ where: { id_task: numId, id_account: userId } });
      if (!taskRecord) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      const count = await Subtask.count({ where: { id_task: numId } });
      const created = await Subtask.create({
        id_task: numId,
        title: title.trim(),
        done: false,
        order_index: count,
      });

      return res.status(201).json({
        message: 'Subtarefa criada com sucesso.',
        subtask: {
          id: String(created.id_subtask),
          id_subtask: created.id_subtask,
          id_task: created.id_task,
          title: created.title,
          done: Boolean(created.done),
          order_index: created.order_index,
        },
      });
    }

    // Memória
    const task = inMemoryTasks.find((t) => t.id === id && (t.id_account || 1) === userId);
    if (!task) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }
    if (!Array.isArray(task.subtasks)) {
      task.subtasks = [];
    }

    const newSt = {
      id: `subtask-${Date.now()}`,
      id_subtask: Date.now(),
      id_task: task.id,
      title: title.trim(),
      done: false,
      order_index: task.subtasks.length,
    };
    task.subtasks.push(newSt);
    saveLocalStore();

    return res.status(201).json({
      message: 'Subtarefa criada com sucesso.',
      subtask: newSt,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao criar subtarefa: ${e.message}` });
  }
};

/**
 * Atualização de subtarefa individual (PUT/PATCH /api/tasks/subtasks/:subtaskId)
 */
export const updateSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { title, done } = req.body;

    if (await isDatabaseConnected()) {
      const numId = Number(subtaskId);
      if (isNaN(numId)) {
        return res.status(400).json({ message: 'ID de subtarefa inválido.' });
      }
      const stRecord = await Subtask.findOne({ where: { id_subtask: numId } });
      if (!stRecord) {
        return res.status(404).json({ message: 'Subtarefa não encontrada.' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title.trim();
      if (done !== undefined) updates.done = Boolean(done);

      await stRecord.update(updates);

      return res.status(200).json({
        message: 'Subtarefa atualizada com sucesso.',
        subtask: {
          id: String(stRecord.id_subtask),
          id_subtask: stRecord.id_subtask,
          id_task: stRecord.id_task,
          title: stRecord.title,
          done: Boolean(stRecord.done),
          order_index: stRecord.order_index,
        },
      });
    }

    // Memória
    let foundSt = null;
    for (const t of inMemoryTasks) {
      if (Array.isArray(t.subtasks)) {
        const st = t.subtasks.find(
          (s) => String(s.id) === String(subtaskId) || String(s.id_subtask) === String(subtaskId)
        );
        if (st) {
          if (title !== undefined) st.title = title.trim();
          if (done !== undefined) st.done = Boolean(done);
          foundSt = st;
          break;
        }
      }
    }

    if (!foundSt) {
      return res.status(404).json({ message: 'Subtarefa não encontrada.' });
    }

    saveLocalStore();

    return res.status(200).json({
      message: 'Subtarefa atualizada com sucesso.',
      subtask: foundSt,
    });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao atualizar subtarefa: ${e.message}` });
  }
};

/**
 * Exclusão de subtarefa individual (DELETE /api/tasks/subtasks/:subtaskId)
 */
export const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;

    if (await isDatabaseConnected()) {
      const numId = Number(subtaskId);
      if (!isNaN(numId)) {
        await Subtask.destroy({ where: { id_subtask: numId } });
      }
      return res.status(200).json({ message: 'Subtarefa excluída com sucesso.', id: subtaskId });
    }

    // Memória
    for (const t of inMemoryTasks) {
      if (Array.isArray(t.subtasks)) {
        t.subtasks = t.subtasks.filter(
          (s) => String(s.id) !== String(subtaskId) && String(s.id_subtask) !== String(subtaskId)
        );
      }
    }

    saveLocalStore();

    return res.status(200).json({ message: 'Subtarefa excluída com sucesso.', id: subtaskId });
  } catch (e) {
    return res.status(500).json({ message: `Erro ao excluir subtarefa: ${e.message}` });
  }
};
