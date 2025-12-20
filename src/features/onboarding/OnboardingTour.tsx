import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles, ArrowDown } from 'lucide-react';
import { View } from '@/types';

interface Step {
  title: string;
  description: string;
  view?: View; // Vista a navegar cuando llegues a este paso
  highlightSelector?: string; // Selector CSS del elemento a resaltar
  highlightPosition?: 'top' | 'bottom' | 'left' | 'right'; // Posición del tooltip respecto al elemento
}

interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
  onNavigate?: (view: View) => void; // Callback para cambiar de vista
}

const steps: Step[] = [
  {
    title: 'Bienvenido a Inventariando',
    description:
      'Aquí verás un resumen de tu negocio: valor total, stock bajo y distribución por categorías. Usa el botón de base de datos para respaldos rápidos.',
    view: View.DASHBOARD,
    highlightSelector: '[data-tour="dashboard-header"]',
    highlightPosition: 'bottom',
  },
  {
    title: 'Navegación y Flujo',
    description:
      'Desde el menú lateral accedés a Stock, Ventas, Clientes y más. En móviles, usá la barra inferior para saltar entre vistas.',
    view: View.INVENTORY,
    highlightSelector: '[data-tour="sidebar"]',
    highlightPosition: 'right',
  },
  {
    title: 'Punto de Venta (POS)',
    description:
      'Iniciá una venta desde Ventas → Cobrar. El POS aplica promociones activas, calcula totales y ajusta stock automáticamente.',
    view: View.SALES,
    highlightSelector: '[data-tour="new-sale-btn"]',
    highlightPosition: 'bottom',
  },
  {
    title: 'IA y Análisis',
    description:
      'En Análisis, el asistente de IA (Gemini) te ayuda con insights de precios, sugerencias de reposición y análisis inteligente del inventario.',
    view: View.ANALYSIS,
    highlightSelector: '[data-tour="ai-section"]',
    highlightPosition: 'left',
  },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ open, onClose, onNavigate }) => {
  const [index, setIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!open) {
      setIndex(0);
      setHighlightRect(null);
      return;
    }

    const current = steps[index];

    // Navegar a la vista del paso
    if (current.view && onNavigate) {
      onNavigate(current.view);
    }

    // Esperar a que el DOM se actualice y buscar el elemento a resaltar
    const timeout = setTimeout(() => {
      if (current.highlightSelector) {
        const element = document.querySelector(current.highlightSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setHighlightRect({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height,
          });
        } else {
          setHighlightRect(null);
        }
      } else {
        setHighlightRect(null);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [open, index, onNavigate]);

  if (!open) return null;

  const current = steps[index];
  const canPrev = index > 0;
  const canNext = index < steps.length - 1;

  const handleNext = () => {
    if (canNext) setIndex(index + 1);
  };

  const handlePrev = () => {
    if (canPrev) setIndex(index - 1);
  };

  // Posición del tooltip según el elemento resaltado
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 72,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    border: '1px solid #e2e8f0',
    padding: '16px',
    maxWidth: '320px',
    width: '90vw',
  };

  if (highlightRect) {
    const padding = 20;
    const tooltipWidth = Math.min(320, window.innerWidth - 32);
    const tooltipHeight = 250; // Estimado

    if (current.highlightPosition === 'bottom') {
      tooltipStyle.top = highlightRect.bottom + padding;
      tooltipStyle.left = Math.max(
        16,
        Math.min(highlightRect.left - 100, window.innerWidth - tooltipWidth - 16)
      );
    } else if (current.highlightPosition === 'top') {
      tooltipStyle.bottom = window.innerHeight - highlightRect.top + padding;
      tooltipStyle.left = Math.max(
        16,
        Math.min(highlightRect.left - 100, window.innerWidth - tooltipWidth - 16)
      );
    } else if (current.highlightPosition === 'right') {
      tooltipStyle.top = Math.max(
        16,
        Math.min(highlightRect.top, window.innerHeight - tooltipHeight - 16)
      );
      tooltipStyle.left = Math.min(
        highlightRect.right + padding,
        window.innerWidth - tooltipWidth - 16
      );
    } else if (current.highlightPosition === 'left') {
      tooltipStyle.top = Math.max(
        16,
        Math.min(highlightRect.top, window.innerHeight - tooltipHeight - 16)
      );
      tooltipStyle.left = Math.max(16, highlightRect.left - tooltipWidth - padding);
    }
  } else {
    // Centrado si no hay elemento
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <>
      {/* Overlay oscuro con spotlight */}
      <div
        className="fixed inset-0 z-[71] bg-black/60 transition-all duration-300"
        onClick={onClose}
        style={{
          clipPath: highlightRect
            ? `polygon(
              0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%,
              ${highlightRect.left - 8}px ${highlightRect.top - 8}px,
              ${highlightRect.left - 8}px ${highlightRect.bottom + 8}px,
              ${highlightRect.right + 8}px ${highlightRect.bottom + 8}px,
              ${highlightRect.right + 8}px ${highlightRect.top - 8}px,
              ${highlightRect.left - 8}px ${highlightRect.top - 8}px
            )`
            : undefined,
        }}
      />

      {/* Borde resaltado del elemento */}
      {highlightRect && (
        <div
          className="fixed z-[71] pointer-events-none border-2 border-blue-500 rounded-lg animate-pulse"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      <div style={tooltipStyle}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <Sparkles size={18} />
            <h3 className="text-base font-semibold">{current.title}</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100 flex-shrink-0">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">{current.description}</p>

        {/* Indicador visual de "haz clic aquí" si hay elemento */}
        {highlightRect && (
          <div className="flex items-center justify-center gap-1 mb-3 text-xs text-blue-500 font-medium animate-bounce">
            <ArrowDown size={14} />
            <span>Explorá esta sección</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={!canPrev}
            className={`inline-flex items-center gap-1 px-3 py-2 rounded border text-sm transition-colors ${
              canPrev
                ? 'border-slate-300 hover:bg-slate-100 text-slate-700'
                : 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
            }`}
          >
            <ChevronLeft size={16} /> Atrás
          </button>

          <div className="text-xs text-slate-500 font-medium">
            {index + 1} / {steps.length}
          </div>

          {canNext ? (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              Siguiente <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1 px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition-colors font-medium"
            >
              ¡Listo!
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default OnboardingTour;
