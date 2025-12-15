import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    title: 'Bienvenido a Inventariando',
    description: 'Aquí verás un resumen de tu negocio: valor total, stock bajo y distribución por categorías. Usa el botón de base de datos para respaldos rápidos.'
  },
  {
    title: 'Navegación y Flujo',
    description: 'Desde el menú lateral accedés a Stock, Ventas, Clientes y más. En móviles, usá la barra inferior para saltar entre vistas.'
  },
  {
    title: 'Punto de Venta (POS)',
    description: 'Iniciá una venta desde Ventas → Cobrar. El POS aplica promociones activas, calcula totales y ajusta stock automáticamente.'
  },
  {
    title: 'IA y Análisis',
    description: 'En Análisis, el asistente de IA (Gemini, con tu login) te ayuda con insights de precios y reposición, sin usar claves del proyecto.'
  }
];

const OnboardingTour: React.FC<{ open: boolean; onClose: () => void; }>= ({ open, onClose }) => {
  const [index, setIndex] = React.useState(0);

  useEffect(() => {
    if (!open) setIndex(0);
  }, [open]);

  if (!open) return null;

  const current = steps[index];
  const canPrev = index > 0;
  const canNext = index < steps.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl p-5">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <Sparkles size={18} />
            <h3 className="text-base font-semibold">Guía Rápida</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{current.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{current.description}</p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded border text-sm ${canPrev ? 'border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800' : 'opacity-40 cursor-not-allowed border-zinc-200 dark:border-zinc-800'}`}
          >
            <ChevronLeft size={16} /> Atrás
          </button>

          <div className="text-xs text-zinc-500">{index + 1} / {steps.length}</div>

          {canNext ? (
            <button
              onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
            >
              ¡Listo!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
