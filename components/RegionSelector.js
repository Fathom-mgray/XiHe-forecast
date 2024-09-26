import React, { useState, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Maximize } from 'lucide-react';

const RegionSelector = React.memo(({ onRegionSelect, onZoomToRegion }) => {
    const [north, setNorth] = useState('');
    const [south, setSouth] = useState('');
    const [east, setEast] = useState('');
    const [west, setWest] = useState('');

    useEffect(() => {
        if (north && south && east && west) {
            onRegionSelect({ north, south, east, west });
        }
    }, [north, south, east, west, onRegionSelect]);

    const handleZoomToRegion = useCallback((e) => {
        e.preventDefault();
        if (north && south && east && west) {
            onZoomToRegion({ north, south, east, west });
        }
    }, [north, south, east, west, onZoomToRegion]);

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

    return (
        <form onSubmit={handleZoomToRegion} className="rounded flex flex-col items-center justify-center space-y-4">
            <InputWithButtons value={north} setValue={setNorth} placeholder="N" />
            <div className="flex justify-between items-center" style={{width: "200px"}}>
                <InputWithButtons value={west} setValue={setWest} placeholder="W" vertical={false} />
                <div className="w-14 h-14 flex items-center justify-center">
                    <Download 
                        size={40} 
                        className="text-white cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-lg"
                        style={{
                            filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))',
                        }}
                    />
                </div>
                <InputWithButtons value={east} setValue={setEast} placeholder="E" vertical={false} />
            </div>
            <InputWithButtons value={south} setValue={setSouth} placeholder="S" />
            <button
                type="submit"
                className="bg-black bg-opacity-50 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 focus:outline-none focus:shadow-outline flex items-center justify-center text-xs"
                disabled={!north || !south || !east || !west}
            >
                <Maximize size={18} className="mr-2" />
                Zoom to Region
            </button>
        </form>
    );
});

export default RegionSelector;