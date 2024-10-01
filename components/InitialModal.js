import React, { useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

const InitialModal = React.memo(({ isOpen, onClose, onSubmit }) => {
    const [north, setNorth] = useState('');
    const [south, setSouth] = useState('');
    const [east, setEast] = useState('');
    const [west, setWest] = useState('');
    
    // Set the initial date to yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const [date, setDate] = useState(yesterday.toISOString().split('T')[0]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        onSubmit({ north, south, east, west, date });
    }, [north, south, east, west, date, onSubmit]);

    const InputWithButtons = useCallback(({ value, setValue, placeholder, vertical = true }) => {
        const handleChange = (e) => {
            const newValue = e.target.value.replace(/[^\d.-]/g, '');
            setValue(newValue);
        };

        const handleIncrement = () => {
            setValue(prev => {
                const num = parseFloat(prev) || 0;
                return (num + 1).toString();
            });
        };

        const handleDecrement = () => {
            setValue(prev => {
                const num = parseFloat(prev) || 0;
                return (num - 1).toString();
            });
        };

        return (
            <div className="relative w-14 h-14">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    className="w-full h-full bg-gray-700 text-white rounded-full text-center text-sm font-semibold focus:outline-none"
                />
                {vertical ? (
                    <>
                        <button type="button" onClick={handleIncrement} className="absolute top-0 left-0 right-0 h-5 flex items-center justify-center">
                            <ChevronUp size={14} color="white" />
                        </button>
                        <button type="button" onClick={handleDecrement} className="absolute bottom-0 left-0 right-0 h-5 flex items-center justify-center">
                            <ChevronDown size={14} color="white" />
                        </button>
                    </>
                ) : (
                    <>
                        <button type="button" onClick={handleDecrement} className="absolute top-0 bottom-0 left-0 w-5 flex items-center justify-center">
                            <ChevronLeft size={14} color="white" />
                        </button>
                        <button type="button" onClick={handleIncrement} className="absolute top-0 bottom-0 right-0 w-5 flex items-center justify-center">
                            <ChevronRight size={14} color="white" />
                        </button>
                    </>
                )}
            </div>
        );
    }, []);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="relative bg-white rounded-lg p-8 max-w-3xl w-full shadow-md">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold">Welcome to Data-driven Ocean Forecast by Fathom Science!</h1>
                    <hr className="my-4 border-gray-300" />
                </div>
                <br/>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center space-y-4">
                        <InputWithButtons value={north} setValue={setNorth} placeholder="N" />
                        <div className="flex justify-between items-center w-48">
                            <InputWithButtons value={west} setValue={setWest} placeholder="W" vertical={false} />
                            <InputWithButtons value={east} setValue={setEast} placeholder="E" vertical={false} />
                        </div>
                        <InputWithButtons value={south} setValue={setSouth} placeholder="S" />
                    </div>
                    <div className="flex items-center space-x-2 bg-black bg-opacity-50 px-3 rounded-full w-fit text-sm shadow-md">
                        <span className="text-white font-semibold whitespace-nowrap">Date:</span>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent px-2 py-1 text-white"
                        />
                    </div>
                    <br/>
                    <hr/>

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-blue-800 to-green-500 text-white rounded-full py-2 px-8 hover:from-blue-900 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Get Started
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
});

export default InitialModal;