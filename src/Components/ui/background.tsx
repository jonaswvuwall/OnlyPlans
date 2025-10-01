import DarkVeil from './DarkVeil';
import type { FC, ReactNode } from 'react';

interface BackgroundWrapperProps {
  children: ReactNode;
}

const BackgroundWrapper: FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background DarkVeil - positioned absolutely to cover the entire viewport */}
      <div className="fixed inset-0 z-0">
        <DarkVeil />
      </div>
      
      {/* Content layer - positioned relatively with higher z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;