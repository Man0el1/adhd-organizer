import React from 'react';
import { Clock } from 'lucide-react';

// Adiciona minutos a um horário no formato HH:MM
export function addMinutesToTime(timeStr, minutesToAdd = 60) {
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
}

export default function TimeFields({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  hasTime = true,
  onToggleHasTime = null,
  isTimeRequired = false,
  isDarkMode = false,
  minTime = '',
  toggleLabel = 'Definir horário específico',
}) {
  const handleStartBlur = () => {
    if (startTime && endTime && startTime >= endTime) {
      onEndTimeChange(addMinutesToTime(startTime, 60));
    }
  };

  return (
    <div className="space-y-2">
      {onToggleHasTime && !isTimeRequired && (
        <div className="flex items-center justify-between pb-0.5">
          <label className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5 cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-[#1d56af]" />
            {toggleLabel}
          </label>
          <input
            type="checkbox"
            checked={hasTime}
            onChange={(e) => onToggleHasTime(e.target.checked)}
            className="rounded border-slate-300 text-[#1d56af] focus:ring-[#1d56af] cursor-pointer"
          />
        </div>
      )}

      {hasTime && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate">
              Início {isTimeRequired && <span className="text-rose-500 font-bold">*</span>}
            </label>
            <input
              type="time"
              required={isTimeRequired}
              min={minTime || undefined}
              value={startTime || ''}
              onChange={(e) => onStartTimeChange(e.target.value)}
              onBlur={handleStartBlur}
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border transition-colors ${
                isTimeRequired ? 'border-[#1d56af]' : isDarkMode ? 'border-slate-700' : 'border-[#d3dce6]'
              } ${
                isDarkMode
                  ? 'bg-slate-900 text-white focus:border-[#1d56af]'
                  : 'bg-white text-slate-900 focus:border-[#1d56af] shadow-xs'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1 truncate">
              Término <span className="text-slate-400 text-[10px]">(Opcional)</span>
            </label>
            <input
              type="time"
              min={startTime || minTime || undefined}
              value={endTime || ''}
              onChange={(e) => onEndTimeChange(e.target.value)}
              className={`w-full rounded-lg px-2.5 py-1.5 text-xs outline-none border transition-colors ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-[#1d56af]'
                  : 'bg-white border-[#d3dce6] text-slate-900 focus:border-[#1d56af] shadow-xs'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
