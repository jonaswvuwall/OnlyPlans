import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';

// Define the structure for a plan
interface Plan {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  activityCount: number;
}

const EditPlans: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Mock plans list - will be populated from database later
  const plans: Plan[] = [
    {
      id: '1',
      name: 'Website Development Project',
      description: 'Complete website redesign with new features',
      createdDate: '2024-01-15',
      activityCount: 8
    },
    {
      id: '2', 
      name: 'Marketing Campaign',
      description: 'Q1 marketing campaign planning and execution',
      createdDate: '2024-01-10',
      activityCount: 12
    }
  ];

  const handleEditPlan = (planId: string) => {
    // Navigate to edit-plan page with planId parameter
    navigate(`/edit-plan/${planId}`);
  };

  const handleViewPlan = (planId: string) => {
    // Navigate to visualization page
    navigate(`/visualization/${planId}`);
  };

  const handleDeletePlan = (planId: string, planName: string) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      t('editPlans.deleteConfirmation').replace('{planName}', planName)
    );
    
    if (confirmDelete) {
      // TODO: Implement actual delete functionality with database
      console.log('Deleting plan:', planId);
      alert(t('editPlans.deleteSuccess'));
      // For now, just log - in real implementation, you would:
      // 1. Call API to delete from database
      // 2. Remove from local state or refetch data
    }
  };

  return (
    <Layout>
      {/* Edit Plans Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6">
            {t('editPlans.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {t('editPlans.subtitle')}
          </p>
          
          {/* Plans List Container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-white">{t('editPlans.selectPlan')}</h2>
              <Button 
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/create-plan')}
              >
                + {t('editPlans.createNewPlan')}
              </Button>
            </div>
            
            {/* Plans List */}
            {plans.length === 0 ? (
              // Empty State
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✏️</div>
                <h3 className="text-xl font-semibold text-white mb-3">{t('editPlans.noPlans.title')}</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">
                  {t('editPlans.noPlans.description')}
                </p>
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => navigate('/create-plan')}
                >
                  {t('editPlans.noPlans.createButton')}
                </Button>
              </div>
            ) : (
              // Plans Grid
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                        <p className="text-white/70 mb-3">{plan.description}</p>
                        <div className="flex gap-4 text-sm text-white/60">
                          <span>{t('editPlans.planInfo.created')}: {plan.createdDate}</span>
                          <span>{t('editPlans.planInfo.activities')}: {plan.activityCount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                          onClick={() => handleEditPlan(plan.id)}
                        >
                          ✏️ {t('editPlans.actions.edit')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-105"
                          onClick={() => handleViewPlan(plan.id)}
                        >
                          👁️ {t('editPlans.actions.view')}
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105"
                          onClick={() => handleDeletePlan(plan.id, plan.name)}
                        >
                          🗑️ {t('editPlans.actions.delete')}
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

export default EditPlans;