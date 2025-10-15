// src/Components/pages/EditPlan.tsx
import Layout from "../ui/Layout";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../../hooks/useTranslation";
import type { FC } from "react";
import axios from "axios";

const API_BASE = "http://localhost:4000";

interface PlanActivity {
  id: string;
  dbId?: number;
  referenceNumber: number;
  activityName: string;
  dauer: string;
  vorgaenger: number[];
}

const EditPlans: FC = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const { t } = useTranslation();

  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [activities, setActivities] = useState<PlanActivity[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const id = planId ? parseInt(planId, 10) : null;

  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;

      try {
        const planResp = await axios.get(`${API_BASE}/netzplaene/${id}`);
        setPlanName(planResp.data.name);
        setPlanDescription(planResp.data.description);

        const actResp = await axios.get(`${API_BASE}/netzplaene/${id}/aktivitaeten`);
        const rawActs: {
          id: number;
          ref_number: number;
          name: string;
          dauer: number;
          vorgaenger: number[];
        }[] = actResp.data;

        const idToRefMap = new Map<number, number>();
        rawActs.forEach((a) => idToRefMap.set(a.id, a.ref_number));

        const loadedActs: PlanActivity[] = rawActs.map((a, idx) => {
          const vorgaengerRefNums = Array.isArray(a.vorgaenger)
            ? a.vorgaenger
                .map((dbId: number) => idToRefMap.get(dbId))
                .filter((refNum): refNum is number => typeof refNum === "number")
            : [];

          return {
            id: Date.now().toString() + idx,
            dbId: a.id,
            referenceNumber: a.ref_number,
            activityName: a.name,
            dauer: a.dauer.toString(),
            vorgaenger: vorgaengerRefNums,
          };
        });

        setActivities(loadedActs);
      } catch (err) {
        console.error("Fehler beim Laden:", err);
      }
    };

    fetchPlan();
  }, [id]);

  const addRow = () => {
    const newActivity: PlanActivity = {
      id: Date.now().toString(),
      referenceNumber: activities.length + 1,
      activityName: "",
      dauer: "",
      vorgaenger: [],
    };
    setActivities((prev) => [...prev, newActivity]);
  };

  const removeRow = (id: string) => {
    const updated = activities
      .filter((a) => a.id !== id)
      .map((a, idx) => ({ ...a, referenceNumber: idx + 1 }));
    setActivities(updated);
  };

  const updateActivity = (id: string, field: keyof PlanActivity, value: any) => {
    setActivities((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));
  };

  const allActivitiesValid = activities.every(
    (a) => a.activityName.trim() !== "" && a.dauer !== ""
  );
  const canSave = planName.trim() !== "" && allActivitiesValid && !isSaving;

  const savePlan = async () => {
    if (!canSave || !id) return;
    setIsSaving(true);

    try {
      await axios.delete(`${API_BASE}/netzplaene/${id}`);

      const planResp = await axios.post(`${API_BASE}/netzplaene`, {
        name: planName,
        description: planDescription,
      });
      const newPlanId: number = planResp.data.id;

      const refNumToDbId = new Map<number, number>();
      for (const a of activities) {
        const createResp = await axios.post(`${API_BASE}/aktivitaeten`, {
          netzplan_id: newPlanId,
          ref_number: a.referenceNumber,
          name: a.activityName,
          dauer: parseFloat(a.dauer || "0"),
        });
        const dbId: number = createResp.data.id;
        refNumToDbId.set(a.referenceNumber, dbId);
      }

      for (const a of activities) {
        if (!a.vorgaenger || a.vorgaenger.length === 0) continue;
        const vorgaengerDbIds = a.vorgaenger
          .map((refNum) => refNumToDbId.get(refNum))
          .filter((x): x is number => typeof x === "number");
        const aktivitaetDbId = refNumToDbId.get(a.referenceNumber);
        if (!aktivitaetDbId) continue;

        await axios.put(`${API_BASE}/aktivitaeten/${aktivitaetDbId}`, {
          ref_number: a.referenceNumber,
          name: a.activityName,
          dauer: parseFloat(a.dauer || "0"),
          vorgaenger: vorgaengerDbIds,
        });
      }

      setIsSaving(false);
      navigate("/manage-plans");
    } catch (err) {
      console.error("Speichern fehlgeschlagen:", err);
      setIsSaving(false);
      alert("Fehler beim Speichern. Siehe Konsole.");
    }
  };

  return (
    <Layout>
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto px-6 min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-8 w-full">
          <h1 className="text-5xl font-bold text-white mb-6">
            {t("editPlan.title") || "Plan Bearbeiten"}
          </h1>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 w-full">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("createPlan.planName")} *
                </label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  {t("createPlan.description")}
                </label>
                <input
                  type="text"
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {t("createPlan.planActivities")}
              </h2>
              <Button
                onClick={addRow}
                className="bg-green-600 hover:bg-green-700 transition-all duration-300"
              >
                + {t("createPlan.addActivity")}
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-medium p-3">#</th>
                    <th className="text-left text-white font-medium p-3">
                      {t("createPlan.activityName")}
                    </th>
                    <th className="text-left text-white font-medium p-3">
                      {t("createPlan.duration")}
                    </th>
                    <th className="text-left text-white font-medium p-3">
                      {t("createPlan.predecessors")}
                    </th>
                    <th className="text-left text-white font-medium p-3">
                      {t("createPlan.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => (
                    <tr key={a.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-3 text-center text-white">{a.referenceNumber}</td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={a.activityName}
                          onChange={(e) => updateActivity(a.id, "activityName", e.target.value)}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={a.dauer}
                          onChange={(e) => updateActivity(a.id, "dauer", e.target.value)}
                          className="w-full px-3 py-2 rounded bg-white/10 border border-white/20 text-white"
                        />
                      </td>
                      <td className="p-3">
                        {activities.filter((x) => x.id !== a.id).map((prev) => (
                          <label key={prev.id} className="inline-flex items-center mr-4 text-white">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={a.vorgaenger.includes(prev.referenceNumber)}
                              onChange={(e) => {
                                const newVorgaenger = e.target.checked
                                  ? [...a.vorgaenger, prev.referenceNumber]
                                  : a.vorgaenger.filter((v) => v !== prev.referenceNumber);
                                updateActivity(a.id, "vorgaenger", newVorgaenger);
                              }}
                            />
                            <span>
                              {prev.referenceNumber} {prev.activityName || ""}
                            </span>
                          </label>
                        ))}
                      </td>
                      <td className="p-3">
                        {activities.length > 1 && (
                          <Button
                            onClick={() => removeRow(a.id)}
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400"
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

            <div className="mt-8 flex justify-end gap-4">
              <Button
                variant="outline"
                className="border-white/20 text-white"
                onClick={() => navigate("/manage-plans")}
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={savePlan}
                disabled={!canSave}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isSaving ? t("createPlan.saving") : t("createPlan.savePlan")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EditPlans;
