import Layout from '../ui/Layout';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import type { FC } from 'react';
import axios from 'axios';

// Struktur für eine Aktivität
interface PlanActivity {
  id: string;
  referenceNumber: number;
  activityName: string;
  dauer: string;
  vorgaenger: number[]; // IDs der Vorgänger
}

const CreatePlan: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [activities, setActivities] = useState<PlanActivity[]>([
    { id: Date.now().toString(), referenceNumber: 1, activityName: '', dauer: '', vorgaenger: [] },
  ]);

  // Neue Zeile hinzufügen
  const addRow = () => {
    const newActivity: PlanActivity = {
      id: Date.now().toString(),
      referenceNumber: activities.length + 1,
      activityName: '',
      dauer: '',
      vorgaenger: [],
    };
    setActivities([...activities, newActivity]);
  };

  // Zeile entfernen
  const removeRow = (id: string) => {
    const updated = activities
      .filter(a => a.id !== id)
      .map((a, idx) => ({ ...a, referenceNumber: idx + 1 }));
    setActivities(updated);
  };

  // Activity-Felder updaten
  const updateActivity = (id: string, field: keyof PlanActivity, value: string | number[]) => {
    setActivities(activities.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };

  // Prüfen, ob alle Pflichtfelder gefüllt sind
  const allActivitiesValid = activities.every(a => a.activityName.trim() !== '' && a.dauer !== '');

  const savePlan = async () => {
    if (!planName.trim() || !allActivitiesValid) return;

    try {
      // 1️⃣ Netzplan erstellen
      const planResp = await axios.post('http://localhost:4000/netzplaene', {
        name: planName,
        description: planDescription,
      });
      const planId = planResp.data.id;

      // 2️⃣ Aktivitäten speichern
      for (const a of activities) {
        await axios.post('http://localhost:4000/aktivitaeten', {
          netzplan_id: planId,
          ref_number: a.referenceNumber,
          name: a.activityName,
          dauer: parseFloat(a.dauer),
          vorgaenger: a.vorgaenger,
        });
      }

      // 3️⃣ Weiterleitung
      navigate('/manage-plans');
    } catch (err) {
      console.error('Fehler beim Speichern:', err);
      alert('Fehler beim Speichern. Prüfe die Konsole.');
    }
  };

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          <h1 className="text-5xl font-bold text-white mb-6">{t('createPlan.title')}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">{t('createPlan.subtitle')}</p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {/* Plan-Metadaten */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-medium mb-2">{t('createPlan.planName')} *</label>
                <input
                  type="text"
                  value={planName}
                  onChange={e => setPlanName(e.target.value)}
                  placeholder={t('createPlan.planNamePlaceholder')}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">{t('createPlan.description')}</label>
                <input
                  type="text"
                  value={planDescription}
                  onChange={e => setPlanDescription(e.target.value)}
                  placeholder={t('createPlan.descriptionPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Aktivitäten-Tabelle */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">{t('createPlan.planActivities')}</h2>
              <Button onClick={addRow} className="bg-green-600 hover:bg-green-700 transition-all duration-300">+ {t('createPlan.addActivity')}</Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-medium p-3">#</th>
                    <th className="text-left text-white font-medium p-3">{t('createPlan.activityName')}</th>
                    <th className="text-left text-white font-medium p-3">{t('createPlan.duration')}</th>
                    <th className="text-left text-white font-medium p-3">{t('createPlan.predecessors')}</th>
                    <th className="text-left text-white font-medium p-3">{t('createPlan.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3 text-center text-white">{a.referenceNumber}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={a.activityName}
                          onChange={e => updateActivity(a.id, 'activityName', e.target.value)}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                          placeholder={t('createPlan.activityNamePlaceholder')}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={a.dauer}
                          onChange={e => updateActivity(a.id, 'dauer', e.target.value)}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                          placeholder={t('createPlan.durationPlaceholder')}
                        />
                      </td>
                      <td className="p-3">
                        {/* Multiselect Checkbox für Vorgänger */}
                        {activities.filter(x => x.id !== a.id).map(prev => (
                          <label key={prev.id} className="inline-flex items-center mr-2 text-white">
                            <input
                              type="checkbox"
                              className="mr-1"
                              checked={a.vorgaenger.includes(prev.referenceNumber)}
                              onChange={e => {
                                const newVorgaenger = e.target.checked
                                  ? [...a.vorgaenger, prev.referenceNumber]
                                  : a.vorgaenger.filter(v => v !== prev.referenceNumber);
                                updateActivity(a.id, 'vorgaenger', newVorgaenger);
                              }}
                            />
                            {prev.referenceNumber}
                          </label>
                        ))}
                      </td>
                      <td className="p-3">
                        {activities.length > 1 && (
                          <Button onClick={() => removeRow(a.id)} size="sm" variant="outline" className="border-red-500 text-red-400">🗑️</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" className="border-white/20 text-white">Cancel</Button>
              <Button
                onClick={savePlan}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={!planName.trim() || !allActivitiesValid}
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
