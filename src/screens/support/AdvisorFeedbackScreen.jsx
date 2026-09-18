import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, MessageSquareWarning, ThumbsDown, ThumbsUp } from 'lucide-react';
import api from '@/api/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const RATING_STYLE = {
  helpful: 'bg-success/10 text-success',
  unhelpful: 'bg-danger/10 text-danger',
};

export default function AdvisorFeedbackScreen() {
  const [rating, setRating] = useState('unhelpful');
  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['advisor-feedback', rating],
    queryFn: () => api.get('/admin/advisor-feedback', { params: rating ? { rating } : {} }).then((response) => response.data),
  });

  return (
    <DashboardLayout title="Lima Feedback">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-fg flex items-center gap-2"><MessageSquareWarning size={21} /> Response Feedback</h2>
          <p className="text-sm text-fg/55 mt-1">Review anonymized customer feedback to identify recurring answer quality problems.</p>
        </div>
        <select className="input sm:w-48" value={rating} onChange={(event) => setRating(event.target.value)}>
          <option value="unhelpful">Needs improvement</option>
          <option value="helpful">Helpful</option>
          <option value="">All feedback</option>
        </select>
      </div>

      {isLoading ? (
        <div className="card py-20 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
      ) : feedback.length === 0 ? (
        <div className="card py-16 text-center text-fg/50">No feedback in this category yet.</div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => {
            const RatingIcon = item.rating === 'helpful' ? ThumbsUp : ThumbsDown;
            return (
              <article key={item.id} className="card">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${RATING_STYLE[item.rating]}`}>
                    <RatingIcon size={14} /> {item.rating === 'helpful' ? 'Helpful' : 'Needs improvement'}
                  </span>
                  <time className="text-xs text-fg/40">{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                {item.reason && <p className="text-sm font-semibold text-danger mb-4">Reason: {item.reason}</p>}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-fg/40 mb-2">Customer asked</p>
                    <p className="text-sm text-fg whitespace-pre-wrap">{item.userMessage}</p>
                  </div>
                  <div className="rounded-lg border border-border p-4">
                    <p className="text-xs uppercase tracking-wider font-bold text-fg/40 mb-2">Lima answered</p>
                    <p className="text-sm text-fg whitespace-pre-wrap">{item.advisorResponse}</p>
                  </div>
                </div>
                {item.comment && <p className="text-sm text-fg/70 mt-4 border-l-2 border-primary pl-3">{item.comment}</p>}
              </article>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
