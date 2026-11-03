import React from 'react';
import { CalendarDays } from 'lucide-react';
import DateField from '../DateField.jsx';
import TimeFields from '../TimeFields.jsx';
import RecurrenceField from '../RecurrenceField.jsx';

export default function CalendarFields({
  date,
  onDateChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  hasTime,
  onToggleHasTime,
  recurrence,
  onRecurrenceChange,
  isDarkMode = false,
}) {
  return (
    <div
      className={`space-y-3 p-3.5 rounded-xl border transition-colors ${
        isDarkMode
          ? 'bg-slate-950/80 border-slate-800'
          : 'bg-[#f0f4f9] border-[#d3dce6]'
      }`}
    >
      <div
        className={`text-[11px] font-bold flex items-center justify-between border-b pb-1.5 ${
          isDarkMode ? 'border-slate-800 text-indigo-300' : 'border-[#d3dce6] text-[#124286]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
          <span>Configurações do Calendário</span>
        </div>
        <span className="text-[10px] font-normal text-slate-400">Prazos e datas</span>
      </div>

      <div className="space-y-3">
        <DateField
          value={date}
          onChange={onDateChange}
          label="Data do Evento"
          required={true}
          isDarkMode={isDarkMode}
        />

        <TimeFields
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
          hasTime={hasTime}
          onToggleHasTime={onToggleHasTime}
          isTimeRequired={false}
          isDarkMode={isDarkMode}
          toggleLabel="Definir horário na linha do tempo"
        />

        <RecurrenceField
          value={recurrence}
          onChange={onRecurrenceChange}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
}
