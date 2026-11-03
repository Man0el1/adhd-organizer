/**
 * Utilitários de data e fuso horário para o FocusMod
 *
 * Garante que datas e horários sejam sempre manipulados de acordo com o
 * fuso horário configurado pelo usuário, eliminando discrepâncias com UTC e
 * evitando que datas avancem ou retrocedam indevidamente.
 */

export const STORAGE_KEY_TIMEZONE = 'focusmod_user_timezone';

/**
 * Obtém o fuso horário detectado automaticamente pelo navegador do usuário
 */
export function getDetectedBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  } catch (err) {
    return 'America/Sao_Paulo';
  }
}

/**
 * Retorna o fuso horário configurado atualmente para o usuário.
 * Prioriza a preferência salva no perfil / localStorage, recorrendo à detecção automática.
 */
export function getUserTimezone() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TIMEZONE);
    if (saved && typeof saved === 'string') {
      return saved;
    }
  } catch (err) {
    // ignorar erro em ambientes restritos
  }
  return getDetectedBrowserTimezone();
}

/**
 * Salva o fuso horário configurado no localStorage e notifica os componentes via evento
 */
export function setUserTimezone(newTz) {
  if (!newTz || typeof newTz !== 'string') return;
  try {
    localStorage.setItem(STORAGE_KEY_TIMEZONE, newTz);
    window.dispatchEvent(
      new CustomEvent('focusmod_timezone_changed', {
        detail: { timezone: newTz },
      })
    );
  } catch (err) {
    console.warn('Aviso ao salvar fuso horário no localStorage:', err);
  }
}

/**
 * Retorna a data atual no formato 'YYYY-MM-DD' para o fuso horário especificado
 * Usa 'en-CA' para padronização no formato ISO local (YYYY-MM-DD) sem passar por UTC.
 */
export function getTodayLocalStr(timeZone = getUserTimezone()) {
  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return dtf.format(new Date());
  } catch (err) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Converte um objeto Date ou string de data para 'YYYY-MM-DD' no fuso horário especificado
 */
export function formatDateToYMD(dateInput, timeZone = getUserTimezone()) {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return '';

  try {
    const dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return dtf.format(d);
  } catch (err) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Decompõe a data e hora atuais para um fuso horário específico
 * Retorna ano, mês, dia, hora, minuto, segundo, string YYYY-MM-DD e minutos desde a meia-noite
 */
export function getTimezoneNowParts(timeZone = getUserTimezone(), dateObj = new Date()) {
  try {
    const dtf = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'America/Sao_Paulo',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const parts = dtf.formatToParts(dateObj);
    const map = {};
    for (const p of parts) map[p.type] = p.value;

    const hour = parseInt(map.hour, 10) % 24;
    const minute = parseInt(map.minute, 10);
    const second = parseInt(map.second, 10);
    const year = parseInt(map.year, 10);
    const month = parseInt(map.month, 10);
    const day = parseInt(map.day, 10);
    const ymd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      ymd,
      timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      timeWithSecondsStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      minutesFromMidnight: hour * 60 + minute,
    };
  } catch (err) {
    const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const ymd = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      ymd,
      timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      timeWithSecondsStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`,
      minutesFromMidnight: hour * 60 + minute,
    };
  }
}

/**
 * Converte com segurança uma string 'YYYY-MM-DD' para objeto Date local à meia-noite
 */
export function parseYMDToLocalDate(ymdStr) {
  if (!ymdStr) return new Date();
  const parts = String(ymdStr).split('T')[0].split('-').map((v) => parseInt(v, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * Soma ou subtrai dias de uma string 'YYYY-MM-DD' usando timestamps UTC,
 * evitando que alterações de horário de verão (DST) ou fuso do browser desloquem a data.
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
 * Formata um rótulo legível em português para uma data YYYY-MM-DD (ex: "Segunda-feira, 12 de Maio")
 */
export function formatDateDisplay(ymdStr, options = { weekday: 'long', day: 'numeric', month: 'long' }) {
  if (!ymdStr) return '';
  const parts = String(ymdStr).split('T')[0].split('-').map((v) => parseInt(v, 10));
  if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return ymdStr;
  }
  // Usar UTC evita que fusos negativos alterem o dia exibido
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12, 0, 0));
  return dt.toLocaleDateString('pt-BR', { ...options, timeZone: 'UTC' });
}

/**
 * Lista curada de fusos horários comuns com foco no Brasil, Portugal e principais regiões mundiais
 */
export const COMMON_TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília / São Paulo / Rio de Janeiro (GMT-3)', region: 'Brasil' },
  { value: 'America/Manaus', label: 'Manaus / Amazonas (GMT-4)', region: 'Brasil' },
  { value: 'America/Belem', label: 'Belém / Pará (GMT-3)', region: 'Brasil' },
  { value: 'America/Fortaleza', label: 'Fortaleza / Ceará (GMT-3)', region: 'Brasil' },
  { value: 'America/Recife', label: 'Recife / Pernambuco (GMT-3)', region: 'Brasil' },
  { value: 'America/Salvador', label: 'Salvador / Bahia (GMT-3)', region: 'Brasil' },
  { value: 'America/Cuiaba', label: 'Cuiabá / Mato Grosso (GMT-4)', region: 'Brasil' },
  { value: 'America/Campo_Grande', label: 'Campo Grande / MS (GMT-4)', region: 'Brasil' },
  { value: 'America/Porto_Velho', label: 'Porto Velho / Rondônia (GMT-4)', region: 'Brasil' },
  { value: 'America/Boa_Vista', label: 'Boa Vista / Roraima (GMT-4)', region: 'Brasil' },
  { value: 'America/Rio_Branco', label: 'Rio Branco / Acre (GMT-5)', region: 'Brasil' },
  { value: 'America/Noronha', label: 'Fernando de Noronha (GMT-2)', region: 'Brasil' },
  { value: 'Europe/Lisbon', label: 'Lisboa / Portugal (GMT+0 / GMT+1)', region: 'Europa' },
  { value: 'Atlantic/Madeira', label: 'Madeira / Portugal (GMT+0 / GMT+1)', region: 'Europa' },
  { value: 'Atlantic/Azores', label: 'Açores / Portugal (GMT-1 / GMT+0)', region: 'Europa' },
  { value: 'Europe/Madrid', label: 'Madrid / Espanha (GMT+1 / GMT+2)', region: 'Europa' },
  { value: 'Europe/London', label: 'Londres / Reino Unido (GMT+0 / GMT+1)', region: 'Europa' },
  { value: 'Europe/Paris', label: 'Paris / França (GMT+1 / GMT+2)', region: 'Europa' },
  { value: 'Europe/Berlin', label: 'Berlim / Alemanha (GMT+1 / GMT+2)', region: 'Europa' },
  { value: 'Europe/Rome', label: 'Roma / Itália (GMT+1 / GMT+2)', region: 'Europa' },
  { value: 'America/New_York', label: 'Nova York / Miami / EUA Leste (GMT-5 / GMT-4)', region: 'América do Norte' },
  { value: 'America/Chicago', label: 'Chicago / EUA Central (GMT-6 / GMT-5)', region: 'América do Norte' },
  { value: 'America/Denver', label: 'Denver / EUA Montanhas (GMT-7 / GMT-6)', region: 'América do Norte' },
  { value: 'America/Los_Angeles', label: 'Los Angeles / San Francisco / EUA Pacífico (GMT-8 / GMT-7)', region: 'América do Norte' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires / Argentina (GMT-3)', region: 'América do Sul' },
  { value: 'America/Santiago', label: 'Santiago / Chile (GMT-3 / GMT-4)', region: 'América do Sul' },
  { value: 'America/Montevideo', label: 'Montevidéu / Uruguai (GMT-3)', region: 'América do Sul' },
  { value: 'America/Bogota', label: 'Bogotá / Colômbia (GMT-5)', region: 'América do Sul' },
  { value: 'Asia/Tokyo', label: 'Tóquio / Japão (GMT+9)', region: 'Ásia' },
  { value: 'Asia/Shanghai', label: 'Xangai / China (GMT+8)', region: 'Ásia' },
  { value: 'Asia/Dubai', label: 'Dubai / Emirados Árabes (GMT+4)', region: 'Oriente Médio' },
  { value: 'Australia/Sydney', label: 'Sydney / Austrália (GMT+10 / GMT+11)', region: 'Oceania' },
  { value: 'UTC', label: 'UTC (Tempo Universal Coordenado)', region: 'Universal' },
];

/**
 * Obtém uma abreviação legível para o fuso horário (ex: "GMT-3" ou "Brasília")
 */
export function getFriendlyTimezoneLabel(timeZone = getUserTimezone()) {
  const match = COMMON_TIMEZONES.find((t) => t.value === timeZone);
  if (match) return match.label.split('(')[0].trim();
  return timeZone.replace(/_/g, ' ');
}
