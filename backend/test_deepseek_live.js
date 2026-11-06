import dotenv from 'dotenv';
dotenv.config();

import { interpretTaskMessage } from './src/services/deepseek/taskInterpreter.js';

const mockUserModels = [
  { id: 'mod-calendario-1', name: 'Meu Calendário', type: 'calendario' },
  { id: 'mod-kanban-2', name: 'Projetos da Faculdade', type: 'kanban' },
];

const today = '2026-11-05';

async function testDeepSeekCall() {
  console.log('Testando chamada real para a API DeepSeek...');
  const prompt = 'Adicione no meu calendário uma tarefa chamada Apresentação de TCC com a descrição Levar os slides impressos, no dia 12 de novembro de 2026 das 14:00 às 16:00 que não se repete.';
  
  try {
    const result = await interpretTaskMessage({
      message: prompt,
      userModels: mockUserModels,
      todayStr: today,
      userTimezone: 'America/Sao_Paulo',
    });

    console.log('Resultado retornado pela DeepSeek:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Erro no teste com DeepSeek:', err);
  }
}

testDeepSeekCall();
