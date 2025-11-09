import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
        Calculadora de Estancia de Estudiante
      </h1>
      <p className="mt-3 text-lg text-slate-400 max-w-3xl mx-auto">
        Calcula las fechas límite clave para tu visa de estudiante según tu fecha de llegada. Encuentra tu fecha máxima de presentación y los rangos de fechas válidos para el inicio de tu curso.
      </p>
    </header>
  );
};