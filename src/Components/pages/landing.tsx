import CardNav from '../ui/CardNav';
import type { FC } from 'react';

const Landing: FC = () => {
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

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center">
      
      {/* CardNav */}
      <div className="w-full pt-8 px-4">
        <CardNav
          logo="/Logo_small-Photoroom.png"
          logoAlt="OnlyPlans Logo"
          items={navItems}
          baseColor="#D3D3D3"
          menuColor="#333333"
          buttonBgColor="#8B5CF6"
          buttonTextColor="#ffffff"
        />
      </div>
      
      {/* Hero Section */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 py-16">
        
        {/* Main Logo with enhanced styling */}
        <div className="relative mb-4 group">
          {/* Logo with enhanced glow */}
          <img 
            src="/Logo_big-Photoroom.png" 
            alt="OnlyPlans Logo" 
            className="relative w-180 h-auto max-w-full max-h-180 object-contain transform group-hover:scale-105 transition-transform duration-500"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5)) drop-shadow(0 0 40px rgba(139, 92, 246, 0.3)) drop-shadow(0 0 60px rgba(139, 92, 246, 0.1)) drop-shadow(0 0 30px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 50px rgba(0, 0, 0, 0.6))'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto space-y-6 animate-fadeIn">
          
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Planning</h3>
              <p className="text-white/60 text-sm">Intelligent tools that adapt to your workflow</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
              <p className="text-white/60 text-sm">Built for speed and efficiency</p>
            </div>
            
            <div className="text-center p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Goal Focused</h3>
              <p className="text-white/60 text-sm">Turn dreams into actionable plans</p>
            </div>
          </div>
        </div>
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

export default Landing;