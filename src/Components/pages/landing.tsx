import Beams from './Beams';
import CardNav from './CardNav';
import type { FC } from 'react';

const Landing: FC = () => {
  // CardNav data
  const navItems = [
    {
      label: 'Products',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Planning Tools', href: '/planning', ariaLabel: 'Go to Planning Tools' },
        { label: 'Analytics', href: '/analytics', ariaLabel: 'Go to Analytics' },
        { label: 'Templates', href: '/templates', ariaLabel: 'Go to Templates' }
      ]
    },
    {
      label: 'Resources',
      bgColor: '#EC4899',
      textColor: '#ffffff',
      links: [
        { label: 'Documentation', href: '/docs', ariaLabel: 'Go to Documentation' },
        { label: 'Tutorials', href: '/tutorials', ariaLabel: 'Go to Tutorials' },
        { label: 'Support', href: '/support', ariaLabel: 'Go to Support' }
      ]
    },
    {
      label: 'Company',
      bgColor: '#10B981',
      textColor: '#ffffff',
      links: [
        { label: 'About Us', href: '/about', ariaLabel: 'Go to About Us' },
        { label: 'Careers', href: '/careers', ariaLabel: 'Go to Careers' },
        { label: 'Contact', href: '/contact', ariaLabel: 'Go to Contact' }
      ]
    }
  ];

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center pt--200">
      {/* Background Beams */}
      <div className="absolute inset-0">
        <Beams
          beamWidth={2}
          beamHeight={15}
          beamNumber={8}
          lightColor="#B069DB"
          speed={4}
          noiseIntensity={1.75}
          scale={0.1}
          rotation={40}
        />
      </div>
      
      {/* CardNav */}
      <CardNav
        logo="/Logo_small-Photoroom.png"
        logoAlt="OnlyPlans Logo"
        items={navItems}
        baseColor="#D3D3D3"
        menuColor="#333333"
        buttonBgColor="#8B5CF6"
        buttonTextColor="#ffffff"
      />
      
      {/* Centered Large Logo */}
      <div className="relative z-10 flex items-center justify-center flex-grow">
        <div className="relative">
          {/* Logo with glow directly around it */}
          <img 
            src="/Logo_big-Photoroom.png" 
            alt="OnlyPlans Logo" 
            className="relative w-180 h-auto max-w-full max-h-180 object-contain"
            style={{
              filter: 'drop-shadow(0 0 15px rgba(139, 92, 246, 0.4)) drop-shadow(0 0 25px rgba(139, 92, 246, 0.2))'
            }}
          />
        </div>
      </div>
      
      {/* Creators Footer */}
      <div className="relative z-10 pb-8">
        <div className="text-center">
          <p className="text-white/60 text-sm mb-3">Created by</p>
          <div className="flex justify-center items-center gap-6 flex-wrap">
            <a 
              href="https://www.linkedin.com/in/jonas-wintrich-a31bb61ba/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-purple-400 transition-colors duration-300 hover:underline"
            >
              Jonas Wintrich
            </a>
            <span className="text-white/40">•</span>
            <a 
              href="https://www.linkedin.com/in/benjamin-klein-549906336/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white font-medium hover:text-purple-400 transition-colors duration-300 hover:underline"
            >
              Benjamin Klein
            </a>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default Landing;