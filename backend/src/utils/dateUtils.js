/**
 * Utilitários de data e fuso horário para o backend do FocusMod
 * Garante que operações de data sejam baseadas no horário local do usuário e não no fuso UTC do servidor
 */

/**
 * Obtém o fuso horário ativo para a requisição atual
 */
export function getUserTimezone(req) {
  if (req?.user?.timezone && typeof req.user.timezone === 'string') {
    return req.user.timezone;
  }
  const headerTz = req?.headers?.['x-user-timezone'];
  if (headerTz && typeof headerTz === 'string') {
    return headerTz;
  }
  const queryTz = req?.query?.timezone;
  if (queryTz && typeof queryTz === 'string') {
    return queryTz;
  }
  return 'America/Sao_Paulo';
}

/**
 * Retorna a data atual no formato 'YYYY-MM-DD' para um determinado fuso horário IANA
 * Utiliza 'en-CA' para obter o formato ISO YYYY-MM-DD diretamente respeitando o fuso informado.
 */
export function getTodayDateStr(timeZone = 'America/Sao_Paulo') {
  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return dtf.format(new Date());
  } catch (err) {
    // Fallback caso o nome do fuso horário seja inválido
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Soma ou subtrai dias de uma data 'YYYY-MM-DD' de forma segura e independente de fuso
 */
export function addDaysToYMD(ymdStr, daysToAdd) {
  if (!ymdStr) return '';
  const parts = String(ymdStr).split('T')[0].split('-').map((v) => parseInt(v, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return ymdStr;
  }
  const utcMs = Date.UTC(parts[0], parts[1] - 1, parts[2] + daysToAdd);
  const d = new Date(utcMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Verifica se uma tarefa se aplica a uma data alvo específica
 * Utiliza timestamps UTC para os componentes da data (ano, mês, dia) a fim de evitar qualquer interferência
 * do fuso horário do servidor ou horário de verão (DST).
 */
export function matchesTargetDate(task, targetDateStr) {
  if (!task.date) return true;
  if (!targetDateStr) return true;

  const taskDateClean = String(task.date).split('T')[0];
  const targetDateClean = String(targetDateStr).split('T')[0];

  if (taskDateClean === targetDateClean) return true;

  const recurrence = task.recurrence || 'none';
  if (recurrence === 'none') return false;

  const taskParts = taskDateClean.split('-').map((v) => parseInt(v, 10));
  const targetParts = targetDateClean.split('-').map((v) => parseInt(v, 10));

  if (taskParts.length < 3 || targetParts.length < 3 || isNaN(taskParts[0]) || isNaN(targetParts[0])) {
    return false;
  }

  // Componentes de data limpos em UTC
  const taskUtc = new Date(Date.UTC(taskParts[0], taskParts[1] - 1, taskParts[2]));
  const targetUtc = new Date(Date.UTC(targetParts[0], targetParts[1] - 1, targetParts[2]));

  // Tarefas futuras não se aplicam a datas anteriores à sua criação
  if (taskUtc.getTime() > targetUtc.getTime()) return false;

  if (recurrence === 'daily') {
    return true;
  }

  if (recurrence === 'weekly') {
    return taskUtc.getUTCDay() === targetUtc.getUTCDay();
  }

  if (recurrence === 'monthly') {
    return taskParts[2] === targetParts[2];
  }

  if (recurrence === 'yearly') {
    return taskParts[2] === targetParts[2] && taskParts[1] === targetParts[1];
  }

  return false;
}
