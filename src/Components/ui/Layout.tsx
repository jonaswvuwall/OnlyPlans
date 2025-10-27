
import type { FC, ReactNode } from 'react';

import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}


const Layout: FC<LayoutProps> = ({ children }) => {
  // const { t } = useTranslation();

  return (
    <div className="relative w-full min-h-screen flex flex-col">
      <div className="flex flex-1 w-full min-h-screen">
        {/* Sidebar: hidden on mobile, visible on md+ */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        {/* Main content area, recentered */}
        <main className="flex-1 flex flex-col items-center justify-start pt-24">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;