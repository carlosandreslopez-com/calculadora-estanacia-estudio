import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
        Calculadora de Estancia de Estudiante
      </h1>
      <p className="mt-3 text-lg text-slate-400 max-w-3xl mx-auto">
        Una calculadora para determinar fechas límite importantes para una solicitud de visa de estudiante basada en la fecha de llegada, la duración de la estancia de turista y los plazos de presentación.
      </p>
    </header>
  );
};