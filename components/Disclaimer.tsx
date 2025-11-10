import React from 'react';
import { InformationCircleIcon } from './IconComponents.tsx';

// Let TypeScript know about our global variable from index.html
declare global {
  interface Window {
    APP_VERSION?: string;
  }
}

export const Disclaimer: React.FC = () => {
  const versionTimestamp = window.APP_VERSION || 'desconocida';

  return (
    <footer className="mt-8 w-full">
      <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6 border border-yellow-500/30 text-yellow-200/80">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-md font-semibold text-yellow-300">Descargo de Responsabilidad</h3>
            <p className="mt-1 text-sm text-slate-400">
              Esta herramienta es solo para fines orientativos y de planificación. Los cálculos se basan en normativas generales y pueden no aplicar a su caso específico. La información proporcionada no constituye asesoría legal. Para obtener asesoramiento oficial y preciso, consulte con un abogado de inmigración o con las autoridades consulares correspondientes.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Próximamente: Encuentre profesionales de inmigración recomendados aquí.
            </p>
          </div>
        </div>
      </div>
      <div className="text-center mt-4 text-xs text-slate-600 font-mono">
        <p>Versión de página cargada: {versionTimestamp}</p>
      </div>
    </footer>
  );
};