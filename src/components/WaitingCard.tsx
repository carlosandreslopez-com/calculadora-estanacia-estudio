import React from 'react';
import { CalendarIcon } from './IconComponents.tsx';

export const WaitingCard: React.FC = () => (
  <section className="bg-surface border border-dashed border-[#d8d4c8] rounded-card px-7 py-12 text-center">
    <div className="w-14 h-14 mx-auto mb-[18px] rounded-[14px] bg-[#f1efe8] flex items-center justify-center text-muted-2">
      <CalendarIcon className="w-7 h-7" />
    </div>
    <h3 className="font-display font-medium text-[23px] text-ink-2 mb-2">Esperando tus fechas</h3>
    <p className="text-[14.5px] leading-[1.55] text-[#828a98] max-w-[380px] mx-auto">
      Introduce tu fecha de llegada y estancia arriba para ver tu fecha límite y tu línea de tiempo.
    </p>
  </section>
);
