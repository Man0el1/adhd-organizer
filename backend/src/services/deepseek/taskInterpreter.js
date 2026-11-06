import deepseekClient from './deepseekClient.js';
import { getToolsForUserModels, toolValidators } from './toolRegistry.js';

/**
 * Interpreta a mensagem do usuário em linguagem natural usando DeepSeek Function Calling.
 * 
 * @param {Object} params
 * @param {string} params.message Mensagem do usuário
 * @param {Array} params.userModels Modelos dinâmicos do usuário
 * @param {string} params.todayStr Data atual (YYYY-MM-DD)
 * @param {string} params.userTimezone Fuso horário do usuário
 * @returns {Promise<Object>} Resultado estruturado (ready_for_confirmation, needs_info, ou error)
 */
export async function interpretTaskMessage({
  message,
  userModels,
  todayStr,
  userTimezone = 'America/Sao_Paulo',
}) {
  if (!message || !message.trim()) {
    return {
      status: 'needs_info',
      message: 'Por favor, descreva a tarefa que você deseja criar.',
    };
  }

  if (!Array.isArray(userModels) || userModels.length === 0) {
    return {
      status: 'error',
      message: 'Nenhum modelo de organização encontrado para o seu usuário.',
    };
  }

  // Prepara lista simplificada dos modelos do usuário com ID, NOME e TIPO
  const userModelsSummary = userModels.map((m) => ({
    id: String(m.id),
    name: m.name,
    type: m.type,
  }));

  // Obtém tools disponíveis para os modelos que o usuário possui
  const tools = getToolsForUserModels(userModels);

  if (tools.length === 0) {
    return {
      status: 'needs_info',
      message: 'Você ainda não possui modelos compatíveis com criação por IA ativos.',
    };
  }

  const systemPrompt = `Você é o assistente inteligente de organização do FocusMod.
Seu papel é interpretar a solicitação em linguagem natural do usuário e chamar a function adequada para estruturar a tarefa.

ATENÇÃO:
1. Você NÃO salva tarefas no banco de dados. Sua única função é chamar a function correta com os argumentos adequados ou pedir esclarecimentos se algo faltar.
2. Os modelos de organização do usuário são DINÂMICOS. O usuário pode personalizar seus nomes.
Estes são os modelos ATUALMENTE disponíveis para este usuário:
${JSON.stringify(userModelsSummary, null, 2)}

3. Data de hoje de referência no fuso do usuário (${userTimezone}): ${todayStr}.
4. Se o usuário falar datas relativas (ex: "hoje", "amanhã", "dia 9", "próxima segunda"), calcule o formato YYYY-MM-DD considerando a data de hoje (${todayStr}). Nunca use datas anteriores a ${todayStr}.
5. Identifique pelo nome qual modelo o usuário está se referindo e use o campo "id" exato desse modelo como o argumento "modelId". NUNCA invente um "modelId".
6. Se o usuário não mencionar qual modelo deseja, mas a mensagem for claramente um evento de calendário com data/horário e houver apenas um modelo de calendário, use-o; se houver ambiguidade entre modelos, pergunte educadamente em qual modelo ele deseja adicionar.
7. Se faltarem informações obrigatórias exigidas para o modelo (por exemplo: data para o Calendário), NÃO chame a function com dados inventados. Em vez disso, responda em texto educado solicitando a informação que falta.
8. Se o usuário fornecer informações irrelevantes para o modelo, ignore-as sem inventar campos.
9. Se você não conseguir compreender a mensagem, se ela estiver confusa, desconexa ou não contiver detalhes compreensíveis sobre uma tarefa, responda com clareza e empatia explicando que não conseguiu entender e sugira um exemplo (ex: "Desculpe, não consegui compreender a sua mensagem. Você poderia descrever a tarefa com o nome e o modelo onde deseja adicioná-la? Exemplo: 'Adicione no meu calendário uma consulta médica amanhã às 15h'").
10. Se a solicitação não for sobre criar ou organizar tarefas, responda amigavelmente explicando seu objetivo no FocusMod.`;

  try {
    const response = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat', // deepseek-chat suporta function calling na API DeepSeek
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message.trim() },
      ],
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: 'auto',
      temperature: 0.1, // Temperatura baixa para consistência lógica
    });

    const choice = response.choices?.[0];
    const messageResponse = choice?.message;

    // Se a IA decidiu chamar uma function
    if (messageResponse?.tool_calls && messageResponse.tool_calls.length > 0) {
      const toolCall = messageResponse.tool_calls[0];
      const functionName = toolCall.function?.name;
      let functionArgs = {};

      try {
        functionArgs = JSON.parse(toolCall.function?.arguments || '{}');
      } catch (parseErr) {
        return {
          status: 'needs_info',
          message: 'Não foi possível compreender os parâmetros da tarefa. Pode reformular a mensagem?',
        };
      }

      const validator = toolValidators[functionName];
      if (!validator) {
        return {
          status: 'error',
          message: `Função ${functionName} não reconhecida pelo backend.`,
        };
      }

      // Validação estrita no backend
      const validationResult = validator(functionArgs, userModels, todayStr);

      if (!validationResult.isValid) {
        // Informações faltando ou argumentos inválidos
        return {
          status: 'needs_info',
          message: validationResult.errors.join(' '),
          missingFields: validationResult.errors,
          rawUnderstood: functionArgs,
        };
      }

      // Informações suficientes e válidas: retorna dados estruturados para confirmação do usuário
      return {
        status: 'ready_for_confirmation',
        functionName,
        targetModel: validationResult.targetModel,
        structuredTask: validationResult.structuredTask,
        summaryFields: validationResult.summaryFields,
        confirmationPrompt: `Entendi que você deseja criar a tarefa "${validationResult.structuredTask.name}" no modelo "${validationResult.targetModel.name}". Deseja confirmar?`,
      };
    }

    // Se a IA respondeu em texto (pedindo mais informações, esclarecimentos ou quando não compreendeu)
    const replyText = (messageResponse?.content || '').trim();
    return {
      status: 'needs_info',
      message:
        replyText ||
        'Desculpe, não consegui compreender a sua solicitação. Poderia descrever a tarefa novamente informando o nome e o modelo onde deseja adicioná-la?',
    };
  } catch (err) {
    console.error('Erro na chamada DeepSeek:', err);
    return {
      status: 'error',
      message: err.message || 'Falha ao se comunicar com o serviço de inteligência artificial.',
    };
  }
}
