import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useEffect, useState } from 'react';
import type { FC } from 'react';
import axios from 'axios';
import { API_BASE } from '../../config/api';

interface Plan {
  id: number;
  name: string;
  description: string;
  activityCount: number;
}

const ManagePlans: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('Fetching plans from backend...');
        const { data: netzplaene } = await axios.get(`${API_BASE}/netzplaene`);
        console.log('Plans fetched:', netzplaene);

        const plansWithCounts = await Promise.all(
          netzplaene.map(async (plan: Pick<Plan, 'id' | 'name' | 'description'>) => {
            try {
              const { data: activities } = await axios.get(`${API_BASE}/netzplaene/${plan.id}/aktivitaeten`);
              return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                activityCount: activities.length,
              };
            } catch (activityError) {
              console.warn(`Failed to fetch activities for plan ${plan.id}:`, activityError);
              // Return plan with 0 activities if activity fetch fails
              return {
                id: plan.id,
                name: plan.name,
                description: plan.description,
                activityCount: 0,
              };
            }
          })
        );

        setPlans(plansWithCounts);
        setError(null);
      } catch (err) {
        console.error('Error fetching plans:', err);
        
        let errorMessage = 'Failed to load plans';
        if (err && typeof err === 'object' && 'code' in err && err.code === 'ERR_NETWORK') {
          errorMessage = `Cannot connect to backend server. Please make sure it is running on ${API_BASE}`;
        } else if (err instanceof Error) {
          errorMessage = `Error: ${err.message}`;
        }
        
        setError(errorMessage);
        setPlans([]); // Set empty array instead of keeping old data
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [t]);

  const handleEditPlan = (planId: number) => {
    navigate(`/edit-plan/${planId}`);
  };

  const handleViewPlan = (planId: number) => {
    navigate(`/visualization/${planId}`);
  };

  const handleDeletePlan = async (planId: number, planName: string) => {
    const confirmDelete = window.confirm(
      t('editPlans.deleteConfirmation').replace('{planName}', planName)
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_BASE}/netzplaene/${planId}`);
      setPlans(prev => prev.filter(p => p.id !== planId));
      alert(t('editPlans.deleteSuccess'));
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert(t('editPlans.deleteError'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-white text-center mt-32">Loading plans...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 min-h-[calc(100vh-200px)]">
          <div className="text-center space-y-8 w-full">
            <h1 className="text-5xl font-bold text-white mb-6">{t('editPlans.title')}</h1>
            
            <div className="bg-white/10 backdrop-blur-md border border-red-500/20 rounded-xl p-8 w-full max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-6xl mb-4">❌</div>
                <h3 className="text-xl font-semibold text-white mb-3">Error Loading Plans</h3>
                <p className="text-white/70 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button
                    className="bg-purple-600 hover:bg-purple-700 transition-all duration-300"
                    onClick={() => {
                      setError(null);
                      setLoading(true);
                      window.location.reload();
                    }}
                  >
                    {t('editPlans.retry')}
                  </Button>
                  <div>
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                      onClick={() => navigate('/create-plan')}
                    >
                      {t('editPlans.createNewPlanInstead')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          <h1 className="text-5xl font-bold text-white mb-6">{t('editPlans.title')}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">{t('editPlans.subtitle')}</p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-semibold text-white">{t('editPlans.selectPlan')}</h2>
              <Button
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                onClick={() => navigate('/create-plan')}
              >
                + {t('editPlans.createNewPlan')}
              </Button>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">✏️</div>
                <h3 className="text-xl font-semibold text-white mb-3">{t('editPlans.noPlans.title')}</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">{t('editPlans.noPlans.description')}</p>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95"
                  onClick={() => navigate('/create-plan')}
                >
                  {t('editPlans.noPlans.createButton')}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                        <p className="text-white/70 mb-3">{plan.description}</p>
                        <div className="flex gap-4 text-sm text-white/60">
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

export default ManagePlans;
