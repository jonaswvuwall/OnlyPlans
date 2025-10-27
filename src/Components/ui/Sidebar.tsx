import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from './button';

const Sidebar: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-md border-r border-white/20 flex flex-col z-40 shadow-lg">
      <div className="flex flex-col items-center py-8 gap-8 flex-1">
        <img
          src="/Logo_small-Photoroom.png"
          alt={t('navigation.logo')}
          className="w-20 h-auto mb-4"
        />
        <Button className="w-48" onClick={() => navigate('/create-plan')}>
          🚀 {t('operation.cards.createPlan.button')}
        </Button>
        <Button className="w-48" onClick={() => navigate('/manage-plans')}>
          ✏️ {t('operation.cards.editPlans.button')}
        </Button>
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
