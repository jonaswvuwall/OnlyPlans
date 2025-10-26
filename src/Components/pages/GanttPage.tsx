
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../config/api';
import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';

interface Activity {
  id: string;
  name: string;
  duration: number;
  start: number;
}

const ROW_HEIGHT = 38;
const BAR_HEIGHT = 18;
const TIME_SCALE = 36;


const GanttPage: React.FC = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [planName, setPlanName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Color customization state
  const [bgColor, setBgColor] = useState('#232046');
  const [lineColor, setLineColor] = useState('#a5b4fc');
  const [barColor, setBarColor] = useState('#2563eb');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await axios.get(`${API_BASE}/netzplaene`);
        const plan = plansRes.data.find((p: any) => p.id === parseInt(planId!));
        if (!plan) throw new Error('Plan not found');
        setPlanName(plan.name);
        const actsRes = await axios.get(`${API_BASE}/netzplaene/${planId}/aktivitaeten`);
        const acts = actsRes.data;
        // Simple Gantt logic: sort by ref_number, calculate start by Vorgänger (max end of predecessors)
        const mapped = acts.map((a: any) => ({
          id: a.id,
          name: a.name,
          duration: parseFloat(a.dauer) || 0,
          ref_number: a.ref_number,
          vorgaenger: a.vorgaenger || [],
        }));
        mapped.sort((a: any, b: any) => a.ref_number - b.ref_number);
        // Calculate start times
        const idToActivity: Record<string, any> = {};
        mapped.forEach((a: any) => { idToActivity[a.id] = a; });
        mapped.forEach((a: any) => {
          if (!a.vorgaenger || a.vorgaenger.length === 0) {
            a.start = 0;
          } else {
            a.start = Math.max(...a.vorgaenger.map((vid: string) => {
              const pred = idToActivity[vid];
              return pred ? (pred.start + pred.duration) : 0;
            }));
          }
        });
        setActivities(mapped);
      } catch (e: any) {
        setError(e.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planId]);

  if (loading) return <Layout><div className="text-white p-8 text-center">Lade Daten...</div></Layout>;
  if (error) return <Layout><div className="text-red-400 p-8 text-center">{error}</div></Layout>;

  // Zeitachse bestimmen
  const minStart = 0;
  const maxEnd = Math.max(...activities.map(a => a.start + a.duration), 1);
  const width = Math.max(700, (maxEnd - minStart + 1) * TIME_SCALE + 180);
  const height = activities.length * ROW_HEIGHT + 60;



  return (
    <Layout>
      <div className="flex flex-col items-center w-full max-w-5xl mx-auto py-8 px-2">
        <h1 className="text-4xl font-bold text-white mb-6">Gantt-Diagramm</h1>
        <h2 className="text-xl text-white/80 mb-8">Projekt: {planName}</h2>
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-wrap gap-6 mb-4 items-center justify-center bg-white/5 border border-white/10 rounded-lg p-4">
              <label className="flex items-center gap-2 text-white text-sm">
                Background
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-7 h-7 rounded border-none outline-none" />
              </label>
              <label className="flex items-center gap-2 text-white text-sm">
                Lines
                <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} className="w-7 h-7 rounded border-none outline-none" />
              </label>
              <label className="flex items-center gap-2 text-white text-sm">
                Activities
                <input type="color" value={barColor} onChange={e => setBarColor(e.target.value)} className="w-7 h-7 rounded border-none outline-none" />
              </label>
            </div>
            <div style={{ width: '100%', overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
              <svg
                width={width}
                height={height}
                style={{
                  background: bgColor,
                  borderRadius: 16,
                  boxShadow: '0 4px 24px #0006',
                  margin: '24px 0',
                  minWidth: 700,
                  maxWidth: '100%',
                  border: '1.5px solid #312e81',
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
                    fill="#fff"
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
                    stroke={lineColor}
                    strokeDasharray="3 3"
                    opacity={1}
                  />
                </g>
              ))}
            </g>
            {/* Aktivitätennamen und Balken */}
            {activities.map((a, idx) => (
              <g key={a.id}>
                {/* Name links */}
                <text
                  x={20}
                  y={ROW_HEIGHT * idx + 48 + 2}
                  fontSize={15}
                  fill="#fff"
                  fontWeight={500}
                  style={{ fontFamily: 'inherit' }}
                >
                  {a.name}
                </text>
                {/* Balken */}
                <rect
                  x={150 + (a.start - minStart) * TIME_SCALE}
                  y={ROW_HEIGHT * idx + 48 - BAR_HEIGHT / 2}
                  width={Math.max(8, a.duration * TIME_SCALE)}
                  height={BAR_HEIGHT}
                  fill={barColor}
                  rx={6}
                  opacity={0.95}
                />
                {/* Dauer auf Balken */}
                <text
                  x={150 + (a.start - minStart) * TIME_SCALE + 8}
                  y={ROW_HEIGHT * idx + 48 + 6}
                  fontSize={13}
                  fill="#fff"
                  fontWeight={600}
                  style={{ fontFamily: 'inherit' }}
                >
                  {a.duration}
                </text>
              </g>
            ))}
            {/* Rahmen */}
            <rect
              x={2}
              y={2}
              width={width - 4}
              height={height - 4}
              rx={10}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.2}
              opacity={0.18}
            />
          </svg>
        </div>
        <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-xl p-6 mt-8 text-white">
          <h3 className="text-xl font-bold mb-4">Wertetabelle</h3>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-blue-200">
                <th className="p-1">Nr</th>
                <th className="p-1">Name</th>
                <th className="p-1">Dauer</th>
                <th className="p-1">Start</th>
                <th className="p-1">Ende</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, idx) => (
                <tr key={a.id} className="text-white/90 border-b border-white/10">
                  <td className="p-1 text-center">{idx + 1}</td>
                  <td className="p-1">{a.name}</td>
                  <td className="p-1 text-center">{a.duration}</td>
                  <td className="p-1 text-center">{a.start}</td>
                  <td className="p-1 text-center">{a.start + a.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="text-sm text-blue-200 mt-2">
            <b>Hinweis:</b> Das Gantt-Diagramm zeigt die Aktivitäten als Balken auf einer Zeitachse. Die Wertetabelle listet alle Aktivitäten mit Start, Ende und Dauer. Die Balken beginnen beim jeweiligen Startzeitpunkt und enden nach der Dauer. Vorgänger werden automatisch berücksichtigt. Nutzen Sie das Diagramm, um den Ablauf und die Parallelität der Aufgaben im Projekt zu erkennen.
          </div>
        </div>
        <div className="flex mt-8">
          <Button onClick={() => navigate('/manage-plans')} className="bg-gray-600 hover:bg-gray-700 transition-all duration-300">← {t('visualization.backButton')}</Button>
        </div>
      </div>
    </div>
  </Layout>
  );
};

export default GanttPage;
