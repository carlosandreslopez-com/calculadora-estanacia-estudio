import React, { useState } from 'react';
import { CalculatorIcon, ErrorIcon } from './IconComponents';

interface DataEntryFormProps {
    onCalculate: (arrivalDate: string, stayDuration: number, presentationDeadline: number) => boolean;
    error: string | null;
    clearError: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ onCalculate, error, clearError }) => {
    const [arrivalDate, setArrivalDate] = useState('');
    const [stayDuration, setStayDuration] = useState('90');
    const [presentationDeadline, setPresentationDeadline] = useState('30');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const durationAsNumber = parseInt(stayDuration, 10);
        const deadlineAsNumber = parseInt(presentationDeadline, 10);

        onCalculate(
            arrivalDate,
            isNaN(durationAsNumber) ? 90 : durationAsNumber,
            isNaN(deadlineAsNumber) ? 30 : deadlineAsNumber
        );
    };
    
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (error) {
            clearError();
        }
    }

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Ingresa los Detalles del Cálculo</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 items-end">
                <div className="lg:col-span-2">
                    <label htmlFor="arrivalDate" className="block text-sm font-medium text-slate-300 mb-1">Fecha de Llegada</label>
                    <input
                        type="date"
                        id="arrivalDate"
                        value={arrivalDate}
                        onChange={handleInputChange(setArrivalDate)}
                        required
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label htmlFor="stayDuration" className="block text-sm font-medium text-slate-300 mb-1">Duración Estancia de Turista (días)</label>
                    <input
                        type="number"
                        id="stayDuration"
                        value={stayDuration}
                        onChange={handleInputChange(setStayDuration)}
                        required
                        min="1"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div className="lg:col-span-2">
                    <label htmlFor="presentationDeadline" className="block text-sm font-medium text-slate-300 mb-1">Plazo de Presentación (días)</label>
                    <input
                        type="number"
                        id="presentationDeadline"
                        value={presentationDeadline}
                        onChange={handleInputChange(setPresentationDeadline)}
                        required
                        min="1"
                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    />
                </div>
                <div className="lg:col-span-1">
                    <button
                        type="submit"
                        className="w-full h-10 flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                        aria-label="Calcular fechas límite"
                    >
                        <CalculatorIcon className="w-5 h-5" />
                        <span>Calcular</span>
                    </button>
                </div>
            </form>
            {error && (
                 <div className="mt-4 bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative text-center flex items-center justify-center gap-2">
                    <ErrorIcon className="h-5 w-5" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    );
};