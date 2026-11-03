import { apiFetch } from './api.js';

const STORAGE_PREFIX = 'focusmod_pomodoro_';

export function getStorageKey(modelId = 'default') {
  return `${STORAGE_PREFIX}${modelId}`;
}

export const DEFAULT_POMODORO_STATE = {
  initialMinutes: 25,
  remainingSeconds: 25 * 60,
  isRunning: false,
  targetEndTime: null,
  mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
  cyclesCompleted: 0,
  selectedTask: null,
  completedNotice: '',
};

// Som suave de notificação usando Web Audio API
export function playChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Tom 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.25); // A5
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tom 2 (eco harmônico)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.45); // D6
    gain2.gain.setValueAtTime(0.15, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.9);
  } catch {
    // Sem áudio disponível ou bloqueado pelo navegador
  }
}

/**
 * Lê o estado do Pomodoro para o modelo indicado, recalculando o tempo restante
 * com base na timestamp caso o cronômetro estivesse rodando.
 */
export function getPomodoroState(modelId = 'default') {
  const key = getStorageKey(modelId);
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return { ...DEFAULT_POMODORO_STATE };
    }
    const state = JSON.parse(raw);

    // Se o timer estava rodando, recalcula os segundos restantes usando targetEndTime
    if (state.isRunning && state.targetEndTime) {
      const now = Date.now();
      const remaining = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
      state.remainingSeconds = remaining;

      if (remaining === 0) {
        // Concluiu enquanto estava em segundo plano ou outra tela
        return handleTimerCompletion(modelId, state);
      }
    }

    return {
      ...DEFAULT_POMODORO_STATE,
      ...state,
    };
  } catch (err) {
    console.error('Erro ao ler estado do Pomodoro:', err);
    return { ...DEFAULT_POMODORO_STATE };
  }
}

/**
 * Salva o estado do Pomodoro e notifica os componentes
 */
export function savePomodoroState(modelId = 'default', state) {
  const key = getStorageKey(modelId);
  try {
    localStorage.setItem(key, JSON.stringify(state));
    window.dispatchEvent(
      new CustomEvent('focusmod_pomodoro_state_changed', {
        detail: { modelId, state },
      })
    );
  } catch (err) {
    console.error('Erro ao salvar estado do Pomodoro:', err);
  }
}

/**
 * Trata o término de uma sessão (foco ou pausa)
 */
export function handleTimerCompletion(modelId = 'default', currentState) {
  const state = { ...currentState };
  state.isRunning = false;
  state.targetEndTime = null;

  if (state.mode === 'focus') {
    state.cyclesCompleted = (state.cyclesCompleted || 0) + 1;

    // A finalização do Pomodoro NÃO conclui automaticamente a tarefa associada
    if (state.selectedTask) {
      const taskName = state.selectedTask.name;
      state.completedNotice = `Ciclo de foco finalizado para "${taskName}"! Bom trabalho!`;
    } else {
      state.completedNotice = 'Sessão de foco concluída! Hora de uma pausa merecida.';
    }


    // Configura o descanso (se múltiplo de 4, pausa longa de 15m; senão pausa curta de 5m)
    const isLongBreak = state.cyclesCompleted % 4 === 0;
    const breakMinutes = isLongBreak ? 15 : 5;
    state.mode = isLongBreak ? 'longBreak' : 'shortBreak';
    state.initialMinutes = breakMinutes;
    state.remainingSeconds = breakMinutes * 60;
  } else {
    state.completedNotice = 'Pausa concluída! Pronto para retomar o foco?';
    state.mode = 'focus';
    state.initialMinutes = 25;
    state.remainingSeconds = 25 * 60;
  }

  // Toca som suave
  playChime();

  // Salva e despacha evento global de conclusão para toasts em qualquer tela
  savePomodoroState(modelId, state);
  window.dispatchEvent(
    new CustomEvent('focusmod_pomodoro_completed', {
      detail: {
        modelId,
        mode: state.mode,
        notice: state.completedNotice,
      },
    })
  );

  return state;
}

/**
 * Inicia o cronômetro para o modelo especificado
 */
export function startPomodoro(modelId = 'default') {
  const state = getPomodoroState(modelId);
  const remaining = state.remainingSeconds > 0 ? state.remainingSeconds : state.initialMinutes * 60;

  state.isRunning = true;
  state.remainingSeconds = remaining;
  state.targetEndTime = Date.now() + remaining * 1000;
  state.completedNotice = '';

  savePomodoroState(modelId, state);
  return state;
}

/**
 * Pausa o cronômetro
 */
export function pausePomodoro(modelId = 'default') {
  const state = getPomodoroState(modelId);
  if (state.isRunning && state.targetEndTime) {
    const now = Date.now();
    state.remainingSeconds = Math.max(0, Math.round((state.targetEndTime - now) / 1000));
  }
  state.isRunning = false;
  state.targetEndTime = null;

  savePomodoroState(modelId, state);
  return state;
}

/**
 * Reinicia o cronômetro para o tempo inicial configurado pelo usuário
 */
export function resetPomodoro(modelId = 'default') {
  const state = getPomodoroState(modelId);
  state.isRunning = false;
  state.targetEndTime = null;
  state.remainingSeconds = (state.initialMinutes || 25) * 60;
  state.completedNotice = '';

  savePomodoroState(modelId, state);
  return state;
}

/**
 * Define a duração configurada pelo usuário (salva e mantida persistentemente)
 */
export function setPomodoroDuration(modelId = 'default', minutes, mode = 'focus') {
  const state = getPomodoroState(modelId);
  const validMinutes = Math.max(1, Math.min(180, Number(minutes) || 25));

  state.isRunning = false;
  state.targetEndTime = null;
  state.initialMinutes = validMinutes;
  state.remainingSeconds = validMinutes * 60;
  if (mode) {
    state.mode = mode;
  }
  state.completedNotice = '';

  savePomodoroState(modelId, state);
  return state;
}

/**
 * Vincula ou desvincula uma tarefa ao Pomodoro
 */
export function setPomodoroSelectedTask(modelId = 'default', task) {
  const state = getPomodoroState(modelId);
  state.selectedTask = task ? { id: task.id, name: task.name, done: Boolean(task.done) } : null;
  savePomodoroState(modelId, state);
  return state;
}

/**
 * Limpa o aviso de conclusão
 */
export function clearCompletedNotice(modelId = 'default') {
  const state = getPomodoroState(modelId);
  state.completedNotice = '';
  savePomodoroState(modelId, state);
  return state;
}

/**
 * Ticker em segundo plano para manter o cronômetro rodando e disparar eventos
 * mesmo quando o usuário navega entre a Agenda Visual, Calendário ou Brain Dump.
 */
let backgroundTickerInterval = null;

export function initGlobalPomodoroTicker() {
  if (backgroundTickerInterval) return;

  backgroundTickerInterval = setInterval(() => {
    // Procura por todas as chaves de Pomodoro salvas no localStorage
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
          const modelId = key.replace(STORAGE_PREFIX, '');
          const state = getPomodoroState(modelId);

          if (state && state.isRunning && state.targetEndTime) {
            const now = Date.now();
            const remaining = Math.max(0, Math.round((state.targetEndTime - now) / 1000));

            if (remaining <= 0) {
              handleTimerCompletion(modelId, state);
            } else {
              window.dispatchEvent(
                new CustomEvent('focusmod_pomodoro_tick', {
                  detail: { modelId, remainingSeconds: remaining, isRunning: true },
                })
              );
            }
          }
        }
      }
    } catch {
      // Ignora erros de concorrência ou leitura
    }
  }, 1000);
}
