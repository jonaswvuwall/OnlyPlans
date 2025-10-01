import type { FC, ReactNode } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative w-full min-h-screen flex flex-col items-center">
      {/* Main Content with top padding to account for fixed header */}
      <div className="relative z-10 flex-grow w-full pt-24">
        {children}
      </div>
      
      {/* Enhanced Creators Footer */}
      <div className="relative z-10 pb-8 px-4">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4 font-light">{t('footer.craftedBy')}</p>
          <div className="flex justify-center items-center gap-8 flex-wrap">
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
            
            <div className="hidden sm:block w-px h-8 bg-white/20"></div>
            
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
      </div>
    </div>
  );
};

export default Layout;