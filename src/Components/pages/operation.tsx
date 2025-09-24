import Beams from './Beams';
import CardNav from './CardNav';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

const Operation: FC = () => {
  const navigate = useNavigate();
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
    <div className="relative w-full min-h-screen flex flex-col items-center pt-8">
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
      
      {/* Operation Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto px-6">
        <div className="text-center space-y-8">
          {/* Title */}
          <h1 className="text-6xl font-bold text-white mb-6">
            Manage your Plans
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Welcome to OnlyPlans Plan Management. Here you can administrate plans and create new ones.
          </p>
          
          {/* Action Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {/* Create Project Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full card-hover">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-3">Create Plan</h3>
              <p className="text-white/70 mb-6 flex-grow">Start creating a new plan and set your team up for success.</p>
              <Button 
                className="w-full mt-auto transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/create-plan')}
              >
                Get Started
              </Button>
            </div>
            
            {/* Manage Teams Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full card-hover">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-white mb-3">Manage Plans</h3>
              <p className="text-white/70 mb-6 flex-grow">Organize your plans and assign roles efficiently.</p>
              <Button 
                className="w-full mt-auto transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/manage-plans')}
              >
                Manage
              </Button>
            </div>
            
            {/* Analytics Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 hover:bg-white/15 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 md:col-span-2 lg:col-span-1 flex flex-col h-full card-hover">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">Download Plans</h3>
              <p className="text-white/70 mb-6 flex-grow">Find, save and share your plans.</p>
              <Button 
                className="w-full mt-auto transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/manage-plans')}
              >
                View Plans
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Operation;