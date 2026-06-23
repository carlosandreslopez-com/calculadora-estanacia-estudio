import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
        Calculadora de Estancia de Estudiante
      </h1>
      <p className="mt-3 text-lg text-slate-400 max-w-3xl mx-auto">
        Calcula tus plazos clave. La solicitud debe presentarse dentro de los primeros <strong>30 días</strong> de tu llegada. Además, el curso debe iniciar al menos <strong>60 días</strong> después de tu solicitud, pero siempre antes de que finalice tu estancia legal como turista.
      </p>
    </header>
  );
};