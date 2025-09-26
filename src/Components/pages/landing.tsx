import Layout from '../ui/Layout';
import type { FC } from 'react';

const Landing: FC = () => {
  return (
    <Layout showGetStartedButton={true}>
      {/* Hero Section */}
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-16">
        
        {/* Main Logo with enhanced styling */}
        <div className="relative mb-8 group">
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
    </Layout>
  );
};

export default Landing;