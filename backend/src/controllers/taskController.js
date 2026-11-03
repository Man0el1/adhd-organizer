import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Task } from '../models/taskModel.js';
import { Model } from '../models/modelModel.js';
import { TaskCalendar } from '../models/TaskTypes/taskCalendarModel.js';
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
  if (str.includes('routine') || str.includes('agenda')) return 'routine';
  if (str.includes('calendario') || str.includes('calendar')) return 'calendario';
  if (str.includes('brain')) return 'brain-dump';
  if (str.includes('pomodoro')) return 'pomodoro';
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

  let doneForTarget = false;
  if (isRecurrent) {
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
  const { done, completedDates } = resolveTaskDoneStatus(t, targetDateStr, comps);

  return {
    id: String(t.id_task),
    dbId: t.id_task,
    id_account: t.id_account,
    name: t.name,
    description: t.description || '',
    notes: t.description || '',
    modelId: resolvedModelId,
    modelIds: [resolvedModelId],
    date: t.date || null,
    startTime: t.startTime || t.start_time || null,
    endTime: t.endTime || t.end_time || null,
    recurrence: t.recurrence || 'none',
    done,
    occurrenceDate: targetDateStr || t.date || null,
    completedDates,
    createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : new Date().toISOString(),
  };
};

// Formata uma tarefa do fallback em memória
const formatInMemoryTask = (t, customModelId = null, targetDateStr = null) => {
  const resolvedModelId = customModelId || t.modelId || (Array.isArray(t.modelIds) && t.modelIds[0]) || 'routine';
  const { done, completedDates } = resolveTaskDoneStatus(t, targetDateStr, inMemoryCompletions);

  return {
    ...t,
    id: String(t.id),
    modelId: resolvedModelId,
    modelIds: [resolvedModelId],
    done,
    occurrenceDate: targetDateStr || t.date || null,
    completedDates,
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
        const matchingModel = await Model.findOne({ where: { type: typeKey } });
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
        (typeof modelId === 'string' && modelId.includes('routine'));

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
        if (t.modelId === modelId) return true;
        if (Array.isArray(t.modelIds) && t.modelIds.includes(modelId)) return true;

        if (modelId === 'routine' && (t.modelId === 'routine' || t.modelId?.includes('routine') || t.modelIds?.includes('routine'))) return true;
        if (modelId === 'calendario' && (t.modelId === 'calendario' || t.modelId?.includes('calendario') || t.modelIds?.includes('calendario'))) return true;
        if (modelId === 'brain-dump' && (t.modelId === 'brain-dump' || t.modelId?.includes('brain') || t.modelIds?.includes('brain-dump'))) return true;

        return false;
      });
    }

    let formatted = filtered.map((t) =>
      formatInMemoryTask(t, modelId, targetDate ? viewDateStr : null)
    );

    const isRoutine =
      modelId === 'routine' ||
      modelType === 'routine' ||
      (typeof modelId === 'string' && modelId.includes('routine'));

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

        if (targetModelId === 'routine' || targetModelId.includes('routine')) {
          if (isForToday || isOverdue) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'calendario' || targetModelId.includes('calendario')) {
          if (isForToday) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'brain-dump' || targetModelId.includes('brain')) {
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

        if (targetModelId === 'routine' || targetModelId.includes('routine')) {
          if (isForToday || isOverdue) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'calendario' || targetModelId.includes('calendario')) {
          if (isForToday) {
            counts[targetModelId] = (counts[targetModelId] || 0) + 1;
          }
        } else if (targetModelId === 'brain-dump' || targetModelId.includes('brain')) {
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
      (typeof finalModelId === 'string' && finalModelId.includes('routine'));

    const isCalendar =
      finalModelId === 'calendario' ||
      (typeof finalModelId === 'string' && finalModelId.includes('calendario'));

    if (isRoutine && !startTime) {
      return res.status(400).json({
        message: 'O horário de início é obrigatório quando a Agenda Visual está selecionada.',
      });
    }

    if ((isCalendar || isRoutine) && !date) {
      return res.status(400).json({ message: 'A data é obrigatória para o modelo selecionado.' });
    }

    const finalDescription = (description || notes || '').trim();

    // Se o banco PostgreSQL estiver configurado e conectado
    if (await isDatabaseConnected()) {
      const typeKey = extractModelType(finalModelId);
      let targetIdModel = null;

      if (typeKey) {
        const foundModel = await Model.findOne({ where: { type: typeKey } });
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
        date: (isCalendar || isRoutine) ? (date || defaultDate) : null,
        startTime: (isRoutine || isCalendar) ? (startTime || null) : null,
        endTime: (isRoutine || isCalendar) ? (finalEndTime || null) : null,
        recurrence: (isCalendar || isRoutine) ? (recurrence || 'none') : 'none',
        done: false,
      });

      if (isCalendar && date) {
        try {
          await TaskCalendar.create({
            id_task: created.id_task,
            start_date: date,
            end_date: date,
            start_time: startTime || null,
            end_time: finalEndTime || null,
          });
        } catch (calErr) {
          console.warn('Nota: TaskCalendar opcional:', calErr.message);
        }
      }

      const formatted = formatSequelizeTask(created, finalModelId, date, []);

      return res.status(201).json({
        message: 'Tarefa criada com sucesso!',
        task: formatted,
      });
    }

    // Fallback em memória
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
      done: false,
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
        await TaskCompletion.destroy({ where: { id_task: numId, id_account: userId } });
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
      date,
      startTime,
      endTime,
      recurrence,
      done,
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
          { model: TaskCompletion, as: 'completions', required: false },
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
      if (startTime !== undefined) updates.startTime = startTime || null;
      if (endTime !== undefined) updates.endTime = endTime || null;
      if (recurrence !== undefined) updates.recurrence = recurrence;
      if (date !== undefined && taskRecord.recurrence === 'none') updates.date = date || null;

      const isRecurrent =
        (updates.recurrence || taskRecord.recurrence) &&
        (updates.recurrence || taskRecord.recurrence) !== 'none';

      // Tratamento de conclusão
      if (done !== undefined) {
        const targetDone = Boolean(done);

        if (isRecurrent) {
          // Tarefa recorrente: atualiza a conclusão específica da ocorrência nesta data
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
          // Garante que a recorrência principal permaneça ativa no banco!
        } else {
          // Tarefa não recorrente: salva em Task.done
          updates.done = targetDone;
          // Também sincroniza com TaskCompletion para consistência
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

      // Recarrega completions atualizadas
      const freshCompletions = await TaskCompletion.findAll({
        where: { id_task: numId, id_account: userId },
      });

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
    if (startTime !== undefined) task.startTime = startTime || null;
    if (endTime !== undefined) task.endTime = endTime || null;
    if (recurrence !== undefined) task.recurrence = recurrence;
    if (date !== undefined && task.recurrence === 'none') task.date = date || null;

    const isRecurrent = task.recurrence && task.recurrence !== 'none';

    if (done !== undefined) {
      const targetDone = Boolean(done);

      if (isRecurrent) {
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
        include: [{ model: TaskCompletion, as: 'completions', required: false }],
      });

      if (!taskRecord) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      const isRecurrent = taskRecord.recurrence && taskRecord.recurrence !== 'none';
      let newDoneState = false;

      if (isRecurrent) {
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

      const freshCompletions = await TaskCompletion.findAll({
        where: { id_task: numId, id_account: userId },
      });

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
    let newDoneState = false;

    if (isRecurrent) {
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
