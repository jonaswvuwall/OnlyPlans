import CardNav from './CardNav';
import type { FC, ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  showGetStartedButton?: boolean;
}

const Layout: FC<LayoutProps> = ({ children, showGetStartedButton = false }) => {
  // CardNav data
  const navItems = [
    {
      label: 'Products',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Planning Tools', href: '/operation', ariaLabel: 'Go to Planning Tools' },
        { label: 'Planned Features', href: 'https://rickrolllol.yourwebsitespace.com/', ariaLabel: 'Go to Planned Features' }
      ]
    },
    {
      label: 'Resources',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Documentation', href: 'https://github.com/jonaswvuwall/OnlyPlans/wiki', ariaLabel: 'Go to Documentation' },
        { label: 'Support', href: '/https://www.support.com/', ariaLabel: 'Go to Support' }
      ]
    },
    {
      label: 'Company',
      bgColor: '#8B5CF6',
      textColor: '#ffffff',
      links: [
        { label: 'Jonas Wintrich', href: 'https://www.linkedin.com/in/jonas-wintrich-a31bb61ba/', ariaLabel: 'Go to Jonas Wintrich LinkedIn' },
        { label: 'Benjamin Klein', href: 'https://www.linkedin.com/in/benjamin-klein-549906336/', ariaLabel: 'Go to Benjamin Klein LinkedIn' }
      ]
    }
  ];

  // Add Get Started button to navigation if requested (for landing page)
  const navItemsWithGetStarted = showGetStartedButton 
    ? [
        ...navItems,
        {
          label: 'Get Started',
          bgColor: '#8B5CF6',
          textColor: '#ffffff',
          links: [
            { label: 'Start Planning', href: '/operation', ariaLabel: 'Go to Planning Tools' }
          ]
        }
      ]
    : navItems;

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center">
      
      {/* CardNav */}
      <div className="w-full pt-8 px-4">
        <CardNav
          logo="/Logo_small-Photoroom.png"
          logoAlt="OnlyPlans Logo"
          items={navItemsWithGetStarted}
          baseColor="#D3D3D3"
          menuColor="#333333"
          buttonBgColor="#8B5CF6"
          buttonTextColor="#ffffff"
        />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex-grow w-full">
        {children}
      </div>
      
      {/* Enhanced Creators Footer */}
      <div className="relative z-10 pb-8 px-4">
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4 font-light">Crafted with passion by</p>
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