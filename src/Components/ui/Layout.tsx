
import type { FC, ReactNode } from 'react';


interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  return (
    <main className="flex-1 flex flex-col items-center justify-start pt-24">
      {children}
    </main>
  );
};

export default Layout;