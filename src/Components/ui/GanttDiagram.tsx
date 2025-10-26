import React from 'react';

interface GanttActivity {
  id: string;
  name: string;
  start: number;
  end: number;
}

interface GanttDiagramProps {
  activities: GanttActivity[];
  minStart: number;
  maxEnd: number;
}


const ROW_HEIGHT = 40;
const BAR_HEIGHT = 22;
const TIME_SCALE = 36; // px per time unit

export const GanttDiagram: React.FC<GanttDiagramProps> = ({ activities, minStart, maxEnd }) => {
  const width = Math.max(700, (maxEnd - minStart + 1) * TIME_SCALE + 180);
  const height = activities.length * ROW_HEIGHT + 60;

  return (
    <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
      <svg
        width={width}
        height={height}
        style={{
          background: 'linear-gradient(90deg, #312e81 0%, #1e1b4b 100%)',
          borderRadius: 18,
          boxShadow: '0 4px 24px #0004',
          border: '1.5px solid #4338ca',
          margin: '24px 0',
          display: 'block',
          minWidth: 700,
          maxWidth: '100%'
        }}
      >
      {/* Zeitachse */}
      <g>
        {Array.from({ length: maxEnd - minStart + 1 }).map((_, i) => (
          <g key={i}>
            <text
              x={150 + i * TIME_SCALE + TIME_SCALE / 2}
              y={34}
              textAnchor="middle"
              fontSize={13}
              fill="#e0e7ff"
              fontWeight={600}
              style={{ fontFamily: 'inherit', letterSpacing: 0.5 }}
            >
              {minStart + i}
            </text>
            <line
              x1={150 + i * TIME_SCALE}
              y1={44}
              x2={150 + i * TIME_SCALE}
              y2={height - 10}
              stroke="#6366f1"
              strokeDasharray="3 3"
              opacity={0.18}
            />
          </g>
        ))}
      </g>
      {/* Aktivitätennamen und Balken */}
      {activities.map((a, idx) => (
        <g key={a.id}>
          {/* Name links */}
          <rect
            x={12}
            y={ROW_HEIGHT * idx + 48 - BAR_HEIGHT / 2}
            width={128}
            height={BAR_HEIGHT + 6}
            rx={8}
            fill="#312e81"
            stroke="#818cf8"
            strokeWidth={1.2}
            opacity={0.95}
          />
          <text
            x={20}
            y={ROW_HEIGHT * idx + 48 + 7}
            fontSize={15}
            fill="#e0e7ff"
            fontWeight={500}
            style={{ fontFamily: 'inherit' }}
          >
            {a.name}
          </text>
          {/* Balken */}
          <defs>
            <linearGradient id={`gantt-bar-gradient-${a.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <rect
            x={150 + (a.start - minStart) * TIME_SCALE}
            y={ROW_HEIGHT * idx + 48 - BAR_HEIGHT / 2}
            width={Math.max(8, (a.end - a.start) * TIME_SCALE)}
            height={BAR_HEIGHT}
            fill={`url(#gantt-bar-gradient-${a.id})`}
            rx={8}
            stroke="#1e40af"
            strokeWidth={1.5}
            filter="drop-shadow(0 2px 8px #1e3a8a33)"
            opacity={0.98}
          />
          {/* Dauer auf Balken */}
          <text
            x={150 + (a.start - minStart) * TIME_SCALE + 10}
            y={ROW_HEIGHT * idx + 48 + 6}
            fontSize={13}
            fill="#fff"
            fontWeight={600}
            style={{ fontFamily: 'inherit' }}
          >
            {a.end - a.start}
          </text>
        </g>
      ))}
      {/* Rahmen */}
      <rect
        x={2}
        y={2}
        width={width - 4}
        height={height - 4}
        rx={16}
        fill="none"
        stroke="#6366f1"
        strokeWidth={1.5}
        opacity={0.18}
      />
      </svg>
    </div>
  );
};
