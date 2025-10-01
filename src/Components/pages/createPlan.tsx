import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';

// Define the structure for an activity (Vorgang)
interface PlanActivity {
  id: string;                    // Internal unique ID
  referenceNumber: number;       // Reference Number (1, 2, 3, etc.) - auto-generated
  activityName: string;          // Activity Name
  dauer: string;                 // Duration
  vorgaengerid: string;         // Predecessor Reference Number
}

const CreatePlan: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Plan metadata state
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');

  // Table data state - now for activities (Vorgänge)
  const [activities, setActivities] = useState<PlanActivity[]>([
    {
      id: '1',
      referenceNumber: 1,
      activityName: '',
      dauer: '',
      vorgaengerid: ''
    }
  ]);

  // Add new row to the table
  const addRow = () => {
    const newReferenceNumber = activities.length + 1;
    const newActivity: PlanActivity = {
      id: Date.now().toString(),
      referenceNumber: newReferenceNumber,
      activityName: '',
      dauer: '',
      vorgaengerid: ''
    };
    setActivities([...activities, newActivity]);
  };

  // Remove row from table
  const removeRow = (id: string) => {
    const updatedActivities = activities
      .filter(activity => activity.id !== id)
      .map((activity, index) => ({
        ...activity,
        referenceNumber: index + 1 // Recalculate reference numbers
      }));
    setActivities(updatedActivities);
  };

  // Update activity data
  const updateActivity = (id: string, field: keyof PlanActivity, value: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };

  // Save plan
  const savePlan = () => {
    const plan = {
      name: planName,
      description: planDescription,
      activities: activities,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    console.log('Saving plan:', plan);
    // TODO: Implement actual save functionality
    alert(t('createPlan.planSaved'));
  };

  return (
    <Layout>
      {/* Create Plan Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-6">
            {t('createPlan.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            {t('createPlan.subtitle')}
          </p>
          
          {/* Plan Form Container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {/* Plan Metadata */}
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-white font-medium mb-2">{t('createPlan.planName')} *</label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder={t('createPlan.planNamePlaceholder')}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">{t('createPlan.description')}</label>
                  <input
                    type="text"
                    value={planDescription}
                    onChange={(e) => setPlanDescription(e.target.value)}
                    placeholder={t('createPlan.descriptionPlaceholder')}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">{t('createPlan.planActivities')}</h2>
              <Button onClick={addRow} className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95">
                + {t('createPlan.addActivity')}
              </Button>
            </div>
            
            {/* Editable Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-medium p-3 min-w-[150px]">{t('createPlan.referenceNumber')}</th>
                    <th className="text-left text-white font-medium p-3 min-w-[200px]">{t('createPlan.activityName')}</th>
                    <th className="text-left text-white font-medium p-3 min-w-[120px]">{t('createPlan.duration')}</th>
                    <th className="text-left text-white font-medium p-3 min-w-[180px]">{t('createPlan.predecessors')}</th>
                    <th className="text-left text-white font-medium p-3 w-[80px]">{t('createPlan.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          <span className="text-white font-medium">{activity.referenceNumber}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={activity.activityName}
                          onChange={(e) => updateActivity(activity.id, 'activityName', e.target.value)}
                          placeholder={t('createPlan.activityNamePlaceholder')}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={activity.dauer}
                          onChange={(e) => updateActivity(activity.id, 'dauer', e.target.value)}
                          placeholder={t('createPlan.durationPlaceholder')}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={activity.vorgaengerid}
                          onChange={(e) => updateActivity(activity.id, 'vorgaengerid', e.target.value)}
                          placeholder={t('createPlan.predecessorsPlaceholder')}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </td>
                      <td className="p-3">
                        {activities.length > 1 && (
                          <Button
                            onClick={() => removeRow(activity.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/20"
                          >
                            🗑️
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Help for predecessor input */}
            <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                💡 <strong>{t('createPlan.tip')}</strong> {t('createPlan.tipText')}
              </p>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {t('common.cancel')}
              </Button>
              <Button 
                onClick={() => navigate('/visualization', { 
                  state: { 
                    planName, 
                    planDescription, 
                    activities: activities.filter(a => a.activityName.trim() !== '') 
                  } 
                })}
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!planName.trim() || activities.length === 0}
              >
                {t('createPlan.visualizePlan')}
              </Button>
              <Button 
                onClick={savePlan}
                className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!planName.trim()}
              >
                {t('createPlan.savePlan')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePlan;
