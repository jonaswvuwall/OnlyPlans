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
    </div>
    
  );
};

export default Landing;