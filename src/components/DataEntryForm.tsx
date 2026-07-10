import React, { useState, useEffect } from 'react';
import { CalculatorIcon, ErrorIcon, CalendarIcon } from './IconComponents.tsx';
import { CalendarPicker } from './CalendarPicker.tsx';
import { FormLayout } from './FormLayout.tsx';
import { diffInDays, formatDateToSpanish, tryParseSpanishDateUTC } from '../utils/dateUtils.ts';

interface DataEntryFormProps {
    onCalculate: (params: { arrivalDate: string; stayDuration?: string; exitDate?: string; }) => boolean;
    error: string | null;
    clearError: () => void;
}

export const DataEntryForm: React.FC<DataEntryFormProps> = ({ onCalculate, error, clearError }) => {
    const [arrivalDate, setArrivalDate] = useState('');
    const [stayDuration, setStayDuration] = useState('90');
    const [exitDate, setExitDate] = useState('');
    const [mode, setMode] = useState<'duration' | 'date'>('duration');
    const [calculatedDuration, setCalculatedDuration] = useState<number | null>(null);
    
    const [isArrivalPickerOpen, setArrivalPickerOpen] = useState(false);
    const [isExitPickerOpen, setExitPickerOpen] = useState(false);

    useEffect(() => {
        if (mode === 'date' && arrivalDate && exitDate) {
            const parsedArrival = tryParseSpanishDateUTC(arrivalDate);
            const parsedExit = tryParseSpanishDateUTC(exitDate);

            if (parsedArrival && parsedExit && parsedExit.getTime() >= parsedArrival.getTime()) {
                const duration = diffInDays(parsedExit, parsedArrival) + 1;
                setCalculatedDuration(duration);
            } else {
                setCalculatedDuration(null);
            }
        } else {
            setCalculatedDuration(null);
        }
    }, [arrivalDate, exitDate, mode]);

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setArrivalPickerOpen(false);
        setExitPickerOpen(false);
        if (mode === 'duration') {
            onCalculate({ arrivalDate, stayDuration });
        } else {
            onCalculate({ arrivalDate, exitDate });
        }
    };
    
    const handleTextChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (error) {
            clearError();
        }
    }
    
    const handleModeChange = (newMode: 'duration' | 'date') => {
        setMode(newMode);
        if (error) {
            clearError();
        }
    }
    
    const handleSelectArrivalDate = (date: Date) => {
        setArrivalDate(formatDateToSpanish(date));
        setArrivalPickerOpen(false);
        if (error) clearError();
    };
    
    const handleSelectExitDate = (date: Date) => {
        setExitDate(formatDateToSpanish(date));
        setExitPickerOpen(false);
        if (error) clearError();
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-6">Ingresa los Detalles del Cálculo</h2>
            
            <form onSubmit={handleSubmit}>
                <FormLayout>
                    {/* --- Field 1: Stay Definition Mode (Spans both columns) --- */}
                    <div className="md:col-span-2">
                      <span className="block text-sm font-medium text-slate-300 mb-2">Define tu estancia de turista:</span>
                      <div className="flex p-1 rounded-lg bg-slate-700/50 w-full sm:w-auto max-w-sm">
                        <button
                            type="button"
                            onClick={() => handleModeChange('duration')}
                            aria-pressed={mode === 'duration'}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 ${mode === 'duration' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                        >
                            Con Duración (días)
                        </button>
                        <button
                            type="button"
                            onClick={() => handleModeChange('date')}
                            aria-pressed={mode === 'date'}
                            className={`w-1/2 py-2 px-4 rounded-md text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500 ${mode === 'date' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-600/50'}`}
                        >
                            Con Fecha de Salida
                        </button>
                      </div>
                    </div>

                    {/* --- Field 2: Arrival Date --- */}
                    <div>
                        <label htmlFor="arrivalDate" className="block text-sm font-medium text-slate-300 mb-1">Fecha de Llegada</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="arrivalDate"
                                value={arrivalDate}
                                onChange={handleTextChange(setArrivalDate)}
                                required
                                placeholder="dd/mm/aaaa"
                                autoComplete="off"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 pr-10 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                             <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setArrivalPickerOpen(!isArrivalPickerOpen)}
                                aria-label="Abrir selector de fecha de llegada"
                            >
                                <CalendarIcon className="h-5 w-5 text-slate-400" />
                            </button>
                            {isArrivalPickerOpen && (
                                <CalendarPicker
                                    currentDate={tryParseSpanishDateUTC(arrivalDate)}
                                    onSelectDate={handleSelectArrivalDate}
                                    onClose={() => setArrivalPickerOpen(false)}
                                />
                            )}
                        </div>
                    </div>
                    
                    {/* --- Field 3: Conditional Input for Stay --- */}
                    <div>
                        {mode === 'duration' ? (
                            <div>
                                <label htmlFor="stayDuration" className="block text-sm font-medium text-slate-300 mb-1">Duración Estancia (días)</label>
                                <input
                                    type="number"
                                    id="stayDuration"
                                    value={stayDuration}
                                    onChange={handleTextChange(setStayDuration)}
                                    required
                                    min="1"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                />
                            </div>
                        ) : (
                            <div>
                                <label htmlFor="exitDate" className="block text-sm font-medium text-slate-300 mb-1">Fecha de Salida de Turista</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="exitDate"
                                        value={exitDate}
                                        onChange={handleTextChange(setExitDate)}
                                        required
                                        placeholder="dd/mm/aaaa"
                                        autoComplete="off"
                                        className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm px-3 pr-10 py-2 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setExitPickerOpen(!isExitPickerOpen)}
                                        aria-label="Abrir selector de fecha de salida"
                                    >
                                        <CalendarIcon className="h-5 w-5 text-slate-400" />
                                    </button>
                                    {isExitPickerOpen && (
                                        <CalendarPicker
                                            currentDate={tryParseSpanishDateUTC(exitDate)}
                                            onSelectDate={handleSelectExitDate}
                                            onClose={() => setExitPickerOpen(false)}
                                        />
                                    )}
                                </div>
                                {calculatedDuration && calculatedDuration > 0 && (
                                    <p className="text-sm text-slate-400 italic mt-2">
                                        Duración de la estancia calculada: <span className="font-semibold text-sky-400 not-italic">{calculatedDuration} días</span>.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </FormLayout>

                {/* --- Calculate Button --- */}
                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
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