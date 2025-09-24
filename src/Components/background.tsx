import Beams from './pages/Beams';
import type { FC, ReactNode } from 'react';

interface BackgroundWrapperProps {
  children: ReactNode;
}

const BackgroundWrapper: FC<BackgroundWrapperProps> = ({ children }) => {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background Beams - positioned absolutely to cover the entire viewport */}
      <div className="fixed inset-0 z-0">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={12}
          lightColor="#ffffff"
          speed={2}
          noiseIntensity={1.75}
          scale={0.2}
          rotation={0}
        />
      </div>
      
      {/* Content layer - positioned relatively with higher z-index */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;