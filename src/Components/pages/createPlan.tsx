import CardNav from '../ui/CardNav';
import { Button } from '../ui/button';
import { useState, FC } from 'react';

// Define the structure for an activity (Vorgang)
interface PlanActivity {
  id: string;                    // temporäre React-ID
  referenceNumber: number;       // Tabellen-Referenznummer
  activityName: string;
  dauer: string;
  vorgaenger: string[];          // temporäre React-IDs der Vorgänger
  dbId?: number;                 // echte DB-ID nach Speicherung
}

// MultiSelect mit Checkboxen
interface MultiSelectProps {
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const MultiSelectCheckbox: FC<MultiSelectProps> = ({ options, selected, onChange }) => {
  const toggleOption = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="border border-white/20 rounded bg-white/10 text-white max-h-40 overflow-y-auto p-2">
      {options.map(opt => (
        <label key={opt.id} className="flex items-center gap-2 p-1 hover:bg-white/10 rounded cursor-pointer">
          <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggleOption(opt.id)} className="accent-purple-500" />
          {opt.label}
        </label>
      ))}
    </div>
  );
};

const CreatePlan: FC = () => {
  const navItems = [
  ];

  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [activities, setActivities] = useState<PlanActivity[]>([
    { id: '1', referenceNumber: 1, activityName: '', dauer: '', vorgaenger: [] }
  ]);

  const addRow = () => {
    const newRef = activities.length + 1;
    setActivities([...activities, { id: Date.now().toString(), referenceNumber: newRef, activityName: '', dauer: '', vorgaenger: [] }]);
  };

  const removeRow = (id: string) => {
    setActivities(activities.filter(a => a.id !== id).map((a, i) => ({ ...a, referenceNumber: i + 1 })));
  };

  const updateActivity = (id: string, field: keyof PlanActivity, value: any) => {
    setActivities(activities.map(a => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const savePlan = async () => {
    try {
      // 1️⃣ Netzplan speichern
      const resPlan = await fetch('http://localhost:4000/netzplaene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: planName, description: planDescription })
      });
      const netzplan = await resPlan.json();
      const netzplanId = netzplan.id;

      // 2️⃣ Alle Aktivitäten speichern, DB-IDs merken
      const tempIdToDbId: Record<string, number> = {};
      for (const a of activities) {
        const resAct = await fetch('http://localhost:4000/aktivitaeten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ netzplan_id: netzplanId, ref_number: a.referenceNumber, name: a.activityName, dauer: Number(a.dauer), vorgaenger: [] })
        });
        const actSaved = await resAct.json();
        tempIdToDbId[a.id] = actSaved.id;
      }

      // 3️⃣ Vorgänger-Mappings speichern
      for (const a of activities) {
        const dbId = tempIdToDbId[a.id];
        const vorgaengerDbIds = a.vorgaenger.map(tempId => tempIdToDbId[tempId]);
        if (vorgaengerDbIds.length > 0) {
          await fetch('http://localhost:4000/aktivitaeten/' + dbId, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ref_number: a.referenceNumber, name: a.activityName, dauer: Number(a.dauer), vorgaenger: vorgaengerDbIds })
          });
        }
      }

      alert('Plan und Aktivitäten inkl. Vorgänger erfolgreich gespeichert!');
      setPlanName('');
      setPlanDescription('');
      setActivities([{ id: '1', referenceNumber: 1, activityName: '', dauer: '', vorgaenger: [] }]);
    } catch (err) {
      console.error(err);
      alert('Fehler beim Speichern!');
    }
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center pt-8">
      <CardNav logo="/Logo_small-Photoroom.png" logoAlt="OnlyPlans Logo" items={navItems} baseColor="#D3D3D3" menuColor="#333333" buttonBgColor="#8B5CF6" buttonTextColor="#ffffff" />
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start max-w-7xl mx-auto px-6 pt-20">
        <div className="text-center space-y-8 w-full">
          <h1 className="text-5xl font-bold text-white mb-6">Create New Plan</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
            Build your project plan step by step with our interactive table editor.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            {/* Plan Metadata */}
            <div className="mb-8 grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-medium mb-2">Plan Name *</label>
                <input type="text" value={planName} onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Enter plan name..." className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <input type="text" value={planDescription} onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Brief description..." className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>

            {/* Table Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Plan Vorgänge</h2>
              <Button onClick={addRow} className="bg-green-600 hover:bg-green-700 transition-all duration-300 hover:scale-105 active:scale-95">+ Add Activity</Button>
            </div>

            {/* Editable Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-medium p-3 min-w-[150px]">Reference Number</th>
                    <th className="text-left text-white font-medium p-3 min-w-[200px]">Activity Name</th>
                    <th className="text-left text-white font-medium p-3 min-w-[120px]">Duration</th>
                    <th className="text-left text-white font-medium p-3 min-w-[120px]">Predecessors</th>
                    <th className="text-left text-white font-medium p-3 w-[80px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3 text-center text-white">{a.referenceNumber}</td>
                      <td className="p-3">
                        <input type="text" value={a.activityName} onChange={(e) => updateActivity(a.id, 'activityName', e.target.value)}
                          placeholder="Enter activity name..." className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </td>
                      <td className="p-3">
                        <input type="text" value={a.dauer} onChange={(e) => updateActivity(a.id, 'dauer', e.target.value)}
                          placeholder="Duration..." className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-purple-500" />
                      </td>
                      <td className="p-3">
                        <MultiSelectCheckbox
                          options={activities.filter(act => act.id !== a.id).map(act => ({ id: act.id, label: `${act.referenceNumber} - ${act.activityName || 'Unnamed'}` }))}
                          selected={a.vorgaenger}
                          onChange={(selected) => updateActivity(a.id, 'vorgaenger', selected)}
                        />
                      </td>
                      <td className="p-3">
                        {activities.length > 1 && <Button onClick={() => removeRow(a.id)} size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">🗑️</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95">Cancel</Button>
              <Button onClick={savePlan} className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!planName.trim()}>Save Plan</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
