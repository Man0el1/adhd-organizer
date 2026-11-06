import {
  createCalendarTaskTool,
  validateCalendarTaskArgs,
} from './tools/createCalendarTask.js';

/**
 * Registro de tools/functions suportadas pela IA.
 * Permite adicionar com facilidade novas functions (ex: create_kanban_task, create_habit_task, etc.)
 */
export const registeredTools = [createCalendarTaskTool];

export const toolValidators = {
  create_calendar_task: validateCalendarTaskArgs,
};

/**
 * Retorna as tools relevantes para os modelos que o usuário possui.
 */
export function getToolsForUserModels(userModels) {
  const modelTypes = new Set(userModels.map((m) => m.type));
  const tools = [];

  if (modelTypes.has('calendario')) {
    tools.push(createCalendarTaskTool);
  }

  // Futuras adições aqui:
  // if (modelTypes.has('kanban')) tools.push(createKanbanTaskTool);
  // if (modelTypes.has('habits')) tools.push(createHabitTaskTool);

  return tools;
}
