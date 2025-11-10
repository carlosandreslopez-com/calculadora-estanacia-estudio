import React from 'react';
import { InformationCircleIcon } from './IconComponents.tsx';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="mt-12 text-center border-t border-slate-700/50 pt-8 pb-4">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-center items-center gap-2 mb-2">
            <InformationCircleIcon className="w-5 h-5 text-slate-400" />
            <h2 className="text-md font-semibold text-slate-300">Descargo de Responsabilidad</h2>
        </div>
        <p className="text-sm text-slate-400/80 mb-3">
          Esta aplicación es una herramienta orientativa. La información proporcionada no constituye asesoría legal y no debe ser considerada como tal. Siempre consulte con un profesional cualificado para su situación específica.
        </p>
        <p className="text-xs text-slate-500 italic">
          Próximamente: Contacta con asesores profesionales directamente desde aquí.
        </p>
      </div>
    </footer>
  );
};