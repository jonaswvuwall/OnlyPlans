import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config/api';

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Schnellzugriff state
  const [recentPlans, setRecentPlans] = useState<Array<{id: number, name: string}>>([]);
  const [loadingQuick, setLoadingQuick] = useState(true);

  useEffect(() => {
    // Fetch last 3 plans for Schnellzugriff
    axios.get(`${API_BASE}/netzplaene`)
      .then(res => {
        const plans = res.data.slice(-3).reverse();
        setRecentPlans(plans);
      })
      .catch(() => setRecentPlans([]))
      .finally(() => setLoadingQuick(false));
  }, []);

  // Mini SVG preview for network plan (placeholder, could be improved)
  const MiniNetzplan = ({ planId }: { planId: number }) => (
    <svg width="60" height="36" viewBox="0 0 60 36" className="rounded bg-white/10 border border-white/20">
      <rect x="5" y="10" width="16" height="16" rx="3" fill="#a5b4fc" />
      <rect x="39" y="10" width="16" height="16" rx="3" fill="#fca5a5" />
      <line x1="21" y1="18" x2="39" y2="18" stroke="#6366f1" strokeWidth="2" />
      <circle cx="13" cy="18" r="2" fill="#6366f1" />
      <circle cx="47" cy="18" r="2" fill="#dc2626" />
    </svg>
  );

  const MiniGantt = ({ planId }: { planId: number }) => (
    <svg width="60" height="36" viewBox="0 0 60 36" className="rounded bg-white/10 border border-white/20">
      <rect x="8" y="10" width="44" height="6" rx="2" fill="#a5b4fc" />
      <rect x="8" y="20" width="28" height="6" rx="2" fill="#fca5a5" />
      <rect x="8" y="28" width="18" height="4" rx="2" fill="#6ee7b7" />
    </svg>
  );

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20 flex flex-col z-40 shadow-lg">
      <div className="flex flex-col items-center py-8 gap-8 flex-1 w-full">
        <img
          src="/Logo_small-Photoroom.png"
          alt={t('navigation.logo')}
          className="w-20 h-auto mb-4"
        />
        <Button className="w-56 h-16 text-lg" onClick={() => navigate('/create-plan')}>
          <span className="text-2xl">🚀</span> <span>{t('operation.cards.createPlan.button')}</span>
        </Button>
        <Button className="w-56 h-16 text-lg" onClick={() => navigate('/manage-plans')}>
          <span className="text-2xl">✏️</span> <span>{t('operation.cards.editPlans.button')}</span>
        </Button>

        {/* Schnellzugriff */}
        <div className="w-full mt-8 px-4">
          <h3 className="text-white text-xs font-semibold mb-2 tracking-widest uppercase">Schnellzugriff</h3>
          {loadingQuick ? (
            <div className="text-white/60 text-xs">Lädt...</div>
          ) : recentPlans.length === 0 ? (
            <div className="text-white/40 text-xs">Keine Pläne</div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentPlans.map(plan => (
                <div key={plan.id} className="flex flex-col items-center bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/networkplan/${plan.id}`)} title="Netzplan anzeigen" className="focus:outline-none">
                      <MiniNetzplan planId={plan.id} />
                    </button>
                    <button onClick={() => navigate(`/gantt/${plan.id}`)} title="Gantt-Diagramm anzeigen" className="focus:outline-none">
                      <MiniGantt planId={plan.id} />
                    </button>
                  </div>
                  <span className="mt-1 text-white text-xs truncate max-w-[110px] text-center w-full" title={plan.name}>{plan.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Creators at the bottom */}
      <div className="flex flex-col items-center pb-8 px-2 mt-auto">
        <p className="text-white/40 text-xs mb-2 font-light">{t('footer.craftedBy')}</p>
        <div className="flex flex-col gap-2 w-full items-center">
          <a
            href="https://www.linkedin.com/in/jonas-wintrich-a31bb61ba/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white/80 hover:text-white font-medium transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
              <span className="text-white text-sm font-semibold">JW</span>
            </div>
            <span className="group-hover:text-purple-300 transition-colors duration-300">Jonas Wintrich</span>
          </a>
          <a
            href="https://www.linkedin.com/in/benjamin-klein-549906336/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white/80 hover:text-white font-medium transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <span className="text-white text-sm font-semibold">BK</span>
            </div>
            <span className="group-hover:text-blue-300 transition-colors duration-300">Benjamin Klein</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
