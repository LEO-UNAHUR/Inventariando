import React, { useEffect, useState } from 'react';
import { X, MessageSquare, Send, Star } from 'lucide-react';
import { trackEvent } from '../services/analyticsService';

interface FeedbackEntry {
  id: string;
  rating: number;
  comment: string;
  view?: string;
  createdAt: number;
}

const STORAGE_KEY = 'inventariando_feedback_entries';

function loadEntries(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntry(entry: FeedbackEntry) {
  try {
    const all = loadEntries();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...all]));
  } catch {
    // no-op
  }
}

const FeedbackWidget: React.FC<{ currentView?: string }> = ({ currentView }) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [justSent, setJustSent] = useState(false);

  const submit = () => {
    if (!rating && !comment) return;
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      rating,
      comment: comment.trim(),
      view: currentView,
      createdAt: Date.now(),
    };
    saveEntry(entry);
    // Analytics (Phase 1 - Beta.1)
    trackEvent('feedback_submitted', {
      rating,
      hasComment: !!comment.trim(),
      view: currentView,
    });
    setJustSent(true);
    setRating(0);
    setComment('');
    setTimeout(() => setJustSent(false), 2500);
    setOpen(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        aria-label="Enviar feedback"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 text-white p-3 shadow-lg hover:bg-blue-700 focus:outline-none"
      >
        <MessageSquare size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg bg-white dark:bg-zinc-900 p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">¿Sugerencias o problemas?</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="mt-3">
              <label className="block text-sm opacity-80 mb-1">Califica esta sección</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    className={`p-2 rounded ${rating >= n ? 'text-yellow-500' : 'text-zinc-400'}`}
                    aria-label={`Calificación ${n}`}
                  >
                    <Star fill={rating >= n ? 'currentColor' : 'transparent'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-sm opacity-80 mb-1">Comentario</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full min-h-[90px] resize-none rounded border border-zinc-300 dark:border-zinc-700 bg-transparent p-2 text-sm"
                placeholder="Contanos qué mejorar o qué te gustó"
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              {justSent && <span className="text-green-600 text-sm">¡Gracias por tu feedback!</span>}
              <button
                onClick={submit}
                className="inline-flex items-center gap-2 rounded bg-green-600 px-3 py-2 text-white text-sm hover:bg-green-700"
              >
                <Send size={16} /> Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
