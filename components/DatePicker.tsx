import React, { useState, useEffect, useRef } from 'react';

interface DatePickerProps {
    currentDate: Date | null;
    onSelectDate: (date: Date) => void;
    onClose: () => void;
}

const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const DatePicker: React.FC<DatePickerProps> = ({ currentDate, onSelectDate, onClose }) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const [viewDate, setViewDate] = useState(currentDate || today);
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const changeMonth = (amount: number) => {
        setViewDate(prev => {
            const newDate = new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + amount, 1));
            return newDate;
        });
    };

    const renderDays = () => {
        const year = viewDate.getUTCFullYear();
        const month = viewDate.getUTCMonth();

        const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
        const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
        
        const days = [];
        
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-start-${i}`} className="w-full aspect-square"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(Date.UTC(year, month, day));
            
            const isSelected = currentDate && date.getTime() === currentDate.getTime();
            const isToday = date.getTime() === today.getTime();

            let classes = 'w-full aspect-square flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors duration-200 ';

            if (isSelected) {
                classes += 'bg-sky-600 text-white font-bold ';
            } else {
                classes += 'text-slate-200 hover:bg-slate-600/50 ';
            }

            if (isToday && !isSelected) {
                classes += 'ring-2 ring-emerald-500 ';
            }

            days.push(
                <button 
                    key={day} 
                    type="button"
                    onClick={() => onSelectDate(date)} 
                    className={classes}
                    aria-label={`Seleccionar ${date.toLocaleDateString()}`}
                    aria-pressed={isSelected}
                >
                    {day}
                </button>
            );
        }
        return days;
    };


    return (
        <div 
            ref={datePickerRef}
            className="absolute top-full right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl p-4 z-50 animate-fade-in-up"
        >
            <div className="flex justify-between items-center mb-4">
                <button type="button" onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Mes anterior">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="font-semibold text-white text-center">
                    {MONTH_NAMES[viewDate.getUTCMonth()]} <span className="text-slate-400">{viewDate.getUTCFullYear()}</span>
                </div>
                <button type="button" onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Mes siguiente">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-400 mb-2">
                {DAY_NAMES.map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {renderDays()}
            </div>
        </div>
    );
};

// Add some basic animation keyframes to the document head
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-up {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in-up {
        animation: fade-in-up 0.2s ease-out forwards;
    }
`;
document.head.appendChild(style);