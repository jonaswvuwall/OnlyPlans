
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../config/api';
import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useTranslation } from '../../hooks/useTranslation';
import { saveAs } from 'file-saver';
import { Download } from 'lucide-react';

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
  const exportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  // Color customization state
  const [bgColor, setBgColor] = useState('#232046');
  const [lineColor, setLineColor] = useState('#a5b4fc');
  const [barColor, setBarColor] = useState('#2563eb');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const plansRes = await axios.get(`${API_BASE}/netzplaene`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const plan = plansRes.data.find((p: any) => p.id === parseInt(planId!));
        if (!plan) throw new Error('Plan not found');
        setPlanName(plan.name);
        const actsRes = await axios.get(`${API_BASE}/netzplaene/${planId}/aktivitaeten`);
        const acts = actsRes.data;
        // Simple Gantt logic: sort by ref_number, calculate start by Vorgänger (max end of predecessors)
        type RawActivity = { id: string | number; name: string; dauer: string | number; ref_number: number; vorgaenger?: (string | number)[] };
        const mapped = (acts as RawActivity[]).map((a) => ({
          id: String(a.id),
          name: a.name,
          duration: typeof a.dauer === 'number' ? a.dauer : parseFloat(a.dauer) || 0,
          ref_number: a.ref_number,
          vorgaenger: Array.isArray(a.vorgaenger) ? a.vorgaenger.map(String) : [],
          start: 0,
        }));
        mapped.sort((a, b) => a.ref_number - b.ref_number);
        // Calculate start times robustly
        const idToActivity: Record<string, typeof mapped[0]> = {};
        mapped.forEach((a) => { idToActivity[a.id] = a; });
        mapped.forEach((a) => {
          if (!a.vorgaenger || a.vorgaenger.length === 0) {
            a.start = 0;
          } else {
            a.start = Math.max(
              0,
              ...a.vorgaenger.map((vid) => {
                const pred = idToActivity[vid];
                return pred ? (pred.start + pred.duration) : 0;
              })
            );
          }
        });
        setActivities(mapped);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [planId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element)?.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // Export function
  const handleExport = async (format: 'png' | 'jpg' | 'pdf') => {
    console.log('Starting export process for format:', format);
    
    if (!exportRef.current || !planName) {
      console.error('Missing export ref or plan data');
      return;
    }
    
    setIsExporting(true);
    setShowExportMenu(false);
    
    try {
      const svgElement = exportRef.current.querySelector('svg');
      
      if (!svgElement) {
        throw new Error('SVG element not found');
      }

      // Get SVG dimensions
      const svgWidth = svgElement.getAttribute('width') || svgElement.clientWidth;
      const svgHeight = svgElement.getAttribute('height') || svgElement.clientHeight;
      
      // Create a serialized SVG
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Set canvas size based on SVG viewBox or dimensions
      const viewBox = svgElement.getAttribute('viewBox');
      let width = parseInt(String(svgWidth));
      let height = parseInt(String(svgHeight));
      
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        width = vbWidth;
        height = vbHeight;
      }
      
      canvas.width = width * 2; // Scale for better quality
      canvas.height = height * 2;
      
      if (ctx) {
        ctx.scale(2, 2);
        // Fill background
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = function() {
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          
          switch (format) {
            case 'png': {
              canvas.toBlob((blob) => {
                if (blob) {
                  saveAs(blob, `${planName}_gantt_diagram.png`);
                } else {
                  throw new Error('Failed to create PNG blob');
                }
                setIsExporting(false);
              });
              break;
            }
              
            case 'jpg': {
              canvas.toBlob((blob) => {
                if (blob) {
                  saveAs(blob, `${planName}_gantt_diagram.jpg`);
                } else {
                  throw new Error('Failed to create JPG blob');
                }
                setIsExporting(false);
              }, 'image/jpeg', 0.95);
              break;
            }
              
            case 'pdf': {
              // PDF export would require additional library like jsPDF
              alert('PDF export coming soon!');
              setIsExporting(false);
              break;
            }
          }
        }
        URL.revokeObjectURL(url);
      };
      
      img.onerror = function() {
        console.error('Failed to load SVG image');
        alert(t('visualization.exportErrors.pngFailed') || 'Export fehlgeschlagen. Bitte versuchen Sie es erneut.');
        setIsExporting(false);
      };
      
      img.src = url;
      
    } catch (error) {
      console.error(`Error exporting as ${format.toUpperCase()}:`, error);
      const errorKey = `visualization.exportErrors.${format}Failed`;
      alert(t(errorKey) || `Export als ${format.toUpperCase()} fehlgeschlagen. Bitte versuchen Sie es erneut.`);
      setIsExporting(false);
    }
  };

  if (loading) return <Layout><div className="text-white p-8 text-center">Lade Daten...</div></Layout>;
  if (error) return <Layout><div className="text-red-400 p-8 text-center">{error}</div></Layout>;

  // Zeitachse bestimmen
  const minStart = 0;
  const maxEnd = Math.max(...activities.map(a => a.start + a.duration), 1);
  // Mehr Platz links/rechts: Offset erhöhen
  const LEFT_OFFSET = 220;
  const width = Math.max(1100, (maxEnd - minStart + 1) * TIME_SCALE + LEFT_OFFSET + 80);
  const height = activities.length * ROW_HEIGHT + 60;



  return (
    <Layout>
      <div className="flex flex-col items-center w-full max-w-7xl mx-auto py-8 px-2">
        <h1 className="text-4xl font-bold text-white mb-6">Gantt-Diagramm</h1>
        <h2 className="text-xl text-white/80 mb-8">Projekt: {planName}</h2>
        
        {/* Export Button */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
              className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              <Download size={18} />
              {isExporting ? t('visualization.exporting') : t('visualization.exportPlan')}
              {!isExporting && (
                <span className="ml-1 text-sm">▼</span>
              )}
            </Button>
            
            {showExportMenu && !isExporting && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden z-50 shadow-xl">
                <button
                  onClick={() => handleExport('png')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 flex items-center gap-3"
                >
                  <span className="text-lg">📸</span>
                  <div>
                    <div className="font-medium">{t('visualization.exportOptions.png.title')}</div>
                    <div className="text-xs text-white/60">{t('visualization.exportOptions.png.description')}</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('jpg')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 flex items-center gap-3"
                >
                  <span className="text-lg">🖼️</span>
                  <div>
                    <div className="font-medium">{t('visualization.exportOptions.jpg.title')}</div>
                    <div className="text-xs text-white/60">{t('visualization.exportOptions.jpg.description')}</div>
                  </div>
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <span className="text-lg">📄</span>
                  <div>
                    <div className="font-medium">{t('visualization.exportOptions.pdf.title')}</div>
                    <div className="text-xs text-white/60">{t('visualization.exportOptions.pdf.description')}</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        
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
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }} ref={exportRef}>
              <svg
                width="98%"
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{
                  background: bgColor,
                  borderRadius: 16,
                  boxShadow: '0 4px 24px #0006',
                  margin: '24px 0',
                  minWidth: 1100,
                  maxWidth: '98vw',
                  border: '1.5px solid #312e81',
                  display: 'block',
                }}
              >
            {/* Zeitachse */}
            <g>
              {Array.from({ length: maxEnd - minStart + 1 }).map((_, i) => (
                <g key={i}>
                  <text
                    x={LEFT_OFFSET + i * TIME_SCALE + TIME_SCALE / 2}
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
                    x1={LEFT_OFFSET + i * TIME_SCALE}
                    y1={44}
                    x2={LEFT_OFFSET + i * TIME_SCALE}
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
                  x={32}
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
                  x={LEFT_OFFSET + (a.start - minStart) * TIME_SCALE}
                  y={ROW_HEIGHT * idx + 48 - BAR_HEIGHT / 2}
                  width={Math.max(8, a.duration * TIME_SCALE)}
                  height={BAR_HEIGHT}
                  fill={barColor}
                  rx={6}
                  opacity={0.95}
                />
                {/* Dauer auf Balken */}
                <text
                  x={LEFT_OFFSET + (a.start - minStart) * TIME_SCALE + 8}
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
