import React, { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';

interface PlanActivity {
  id: string;
  referenceNumber: number;
  activityName: string;
  dauer: string;
  vorgaenger: number[];
}

interface Props {
  activities: PlanActivity[];
  activity: PlanActivity;
  updateActivity: (id: string, field: keyof PlanActivity, value: string | number | number[]) => void;
  t: (key: string) => string;
}

const VorgaengerMultiSelect: FC<Props> = ({ activities, activity, updateActivity, t }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const available = activities.filter(x => x.id !== activity.id && !activity.vorgaenger.includes(x.referenceNumber));
  const filtered = available.filter(a =>
    a.activityName.toLowerCase().includes(search.toLowerCase()) ||
    a.referenceNumber.toString().includes(search)
  );

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div className="relative min-w-[220px]">
      <div
        className="flex flex-wrap gap-2 items-center bg-white/10 border border-white/20 rounded px-2 py-1 cursor-pointer min-h-[38px]"
        onClick={() => setOpen(true)}
        tabIndex={0}
        onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}
      >
        {activity.vorgaenger.map(v => {
          const found = activities.find(act => act.referenceNumber === v);
          return (
            <span key={v} className="inline-flex items-center bg-purple-700/60 text-white px-2 py-1 rounded text-xs">
              {v}{found && found.activityName ? ` ${found.activityName}` : ''}
              <button
                type="button"
                className="ml-1 text-red-300 hover:text-red-500"
                onClick={e => { e.stopPropagation(); updateActivity(activity.id, 'vorgaenger', activity.vorgaenger.filter(x => x !== v)); }}
                title="Vorgänger entfernen"
              >×</button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          className="bg-transparent border-none outline-none text-white flex-1 min-w-[40px]"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={activity.vorgaenger.length === 0 ? t('createPlan.selectPredecessor') : ''}
          onFocus={() => setOpen(true)}
        />
      </div>
      {open && (
        <div className="absolute left-0 top-full z-30 bg-[#181825] border border-white/20 rounded shadow-lg mt-1 w-full max-h-48 overflow-auto animate-fade-in">
          {filtered.length === 0 ? (
            <div className="text-white/60 text-xs p-2">{t('createPlan.noPredecessors') || 'Keine Vorgänger verfügbar'}</div>
          ) : (
            filtered.map(prev => (
              <div
                key={prev.id}
                className="px-3 py-2 text-white hover:bg-blue-800/40 cursor-pointer text-sm"
                onMouseDown={e => { e.preventDefault(); updateActivity(activity.id, 'vorgaenger', [...activity.vorgaenger, prev.referenceNumber]); setSearch(''); }}
              >
                {prev.referenceNumber} {prev.activityName || ''}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VorgaengerMultiSelect;
