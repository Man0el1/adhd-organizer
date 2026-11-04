import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import DateField from '../DateField.jsx';
import TimeFields from '../TimeFields.jsx';
import RecurrenceField from '../RecurrenceField.jsx';

export default function VisualAgendaFields({
  date,
  onDateChange,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  recurrence,
  onRecurrenceChange,
  minDate = '',
  minTime = '',
  isDarkMode = false,
}) {
  return (
    <div
      className={`space-y-3 p-3.5 rounded-xl border transition-colors ${
        isDarkMode
          ? 'bg-slate-950/80 border-slate-800'
          : 'bg-[#eef3f9] border-[#d3dce6]'
      }`}
    >
      <div
        className={`text-[11px] font-bold flex items-center justify-between border-b pb-1.5 ${
          isDarkMode ? 'border-slate-800 text-blue-300' : 'border-[#d3dce6] text-[#124286]'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>Bloco da Agenda Visual</span>
        </div>
        <span className="text-[10px] font-normal text-slate-400">Horário obrigatório</span>
      </div>

      <div className="space-y-3">
        <DateField
          value={date}
          onChange={onDateChange}
          label="Data da Atividade"
          required={true}
          min={minDate}
          isDarkMode={isDarkMode}
        />

        <TimeFields
          startTime={startTime}
          endTime={endTime}
          onStartTimeChange={onStartTimeChange}
          onEndTimeChange={onEndTimeChange}
          hasTime={true}
          onToggleHasTime={null}
          isTimeRequired={true}
          minTime={minTime}
          isDarkMode={isDarkMode}
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
