import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

// Define the structure for a plan
interface Plan {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  activityCount: number;  // Changed from processCount to activityCount
  status: string;
}

const ManagePlans: FC = () => {
  const navigate = useNavigate();

  // Empty plans list - will be populated later
  const plans: Plan[] = [];

  return (
    <Layout>
      {/* Manage Plans Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6">
            Manage Your Plans
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            View, edit, and organize all your plans in one place.
          </p>
          
          {/* Plans List Container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-white">Your Plans</h2>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/create-plan')}
              >
                + Create New Plan
              </Button>
            </div>
            
            {/* Plans List */}
            {plans.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-white mb-3">No Plans Yet</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  You haven't created any plans yet. Click "Create New Plan" to get started with your first project plan.
                </p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => navigate('/create-plan')}
                >
                  Create Your First Plan
                </Button>
              </div>
            ) : (
              // Plans Grid - will show when plans exist
              <div className="grid gap-4">
                {plans.map((plan, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                        <p className="text-white/70 mb-3">{plan.description}</p>
                        <div className="flex gap-4 text-sm text-white/60">
                          <span>Created: {plan.createdDate}</span>
                          <span>Activities: {plan.activityCount}</span>
                          <span>Status: {plan.status}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagePlans;
