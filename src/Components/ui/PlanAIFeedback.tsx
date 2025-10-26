import React, { useState } from 'react';
import axios from 'axios';
import { Button } from './button';

const PlanAIFeedback: React.FC<{ planId: string | number }> = ({ planId }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAIFeedback = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await axios.post('/api/ai-feedback', { planId });
      setFeedback(res.data.feedback);
    } catch (e: any) {
      setError(e.message || 'Error fetching AI feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-24 right-8 z-50 flex flex-col items-end">
      <Button onClick={handleAIFeedback} className="mb-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
        💡 AI Feedback
      </Button>
      {loading && <div className="text-xs text-gray-300">Loading...</div>}
      {error && <div className="text-xs text-red-400">{error}</div>}
      {feedback && (
        <div className="bg-white text-gray-900 rounded shadow-lg p-4 max-w-xs text-sm whitespace-pre-line mt-2">
          {feedback}
        </div>
      )}
    </div>
  );
};

export default PlanAIFeedback;
