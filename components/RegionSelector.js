import React, { useState, useCallback, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download, Maximize, Loader } from 'lucide-react';

const RegionSelector = React.memo(({ 
    onRegionSelect, 
    onZoomToRegion, 
    depth, 
    activeOverlay, 
    baseDate, 
    selectedDate 
}) => {
    const [north, setNorth] = useState('');
    const [south, setSouth] = useState('');
    const [east, setEast] = useState('');
    const [west, setWest] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isValidCoordinate = (value) => {
        const num = parseFloat(value);
        return value !== '' && !isNaN(num) && num >= -180 && num <= 180;
    };

    useEffect(() => {
        if (isValidCoordinate(north) && isValidCoordinate(south) && 
            isValidCoordinate(east) && isValidCoordinate(west)) {
            onRegionSelect({ north, south, east, west });
        }
    }, [north, south, east, west, onRegionSelect]);

    const handleZoomToRegion = useCallback((e) => {
        e.preventDefault();
        if (isValidCoordinate(north) && isValidCoordinate(south) && 
            isValidCoordinate(east) && isValidCoordinate(west)) {
            onZoomToRegion({ north, south, east, west });
        }
    }, [north, south, east, west, onZoomToRegion]);





    const handleDownload = useCallback(() => {
        if (isValidCoordinate(north) && isValidCoordinate(south) && 
            isValidCoordinate(east) && isValidCoordinate(west)) {
            
            const currentDate = new Date();
            const effectiveBaseDate = baseDate instanceof Date ? baseDate : currentDate;
            
            const effectiveSelectedDate = selectedDate instanceof Date ? selectedDate : currentDate;
            const lead = Math.round((effectiveSelectedDate - effectiveBaseDate) / (1000 * 60 * 60 * 24));


            const baseUrl = 'http://98.81.212.199:5000/download-data/';
            const queryParams = new URLSearchParams({
                date_init: effectiveBaseDate.toISOString().split('T')[0],
                variable: activeOverlay,
                lead: lead.toString(),
                depth: depth.toString(),
            });
    

            const boundsString = `${south},${north},${west},${east}`;
            const url = `${baseUrl}?${queryParams.toString()}&bounds=${boundsString}`;

            console.log(url)
    
            setIsLoading(true);
    
            fetch(url, {
                method: 'GET',
                headers: {
                    'accept': 'application/json'
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.blob();
            })
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = downloadUrl;
                

                const formatCoordinate = (value, isLatitude) => {
                    const absValue = Math.abs(parseFloat(value));
                    const direction = isLatitude 
                        ? (parseFloat(value) >= 0 ? 'N' : 'S')
                        : (parseFloat(value) >= 0 ? 'E' : 'W');
                    return `${Math.floor(absValue)}${direction}`;
                };
    
                const northStr = formatCoordinate(north, true);
                const southStr = formatCoordinate(south, true);
                const eastStr = formatCoordinate(east, false);
                const westStr = formatCoordinate(west, false);
    
                const initDate = queryParams.get('date_init').replace(/-/g, '');
                const leadStr = lead.toString().padStart(2, '0');
                const depthStr = depth.toString().padStart(2, '0');
                const varName = activeOverlay.toUpperCase();
    
                a.download = `init${initDate}_lead${leadStr}_depth${depthStr}_var${varName}_${northStr}_${southStr}_${westStr}_${eastStr}.nc`;
                
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(downloadUrl);
            })
            .catch(error => {
                console.error('Download failed:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
        }
    }, [north, south, east, west, depth, activeOverlay, baseDate, selectedDate]);






    const InputWithButtons = useCallback(({ value, setValue, placeholder, vertical = true }) => {
        const handleChange = (e) => {
            const newValue = e.target.value.replace(/[^\d.-]/g, '');
            if (newValue === '' || newValue === '-' || (parseFloat(newValue) >= -180 && parseFloat(newValue) <= 180)) {
                setValue(newValue);
            }
        };

        const adjustValue = (adjustment) => {
            setValue(prev => {
                const num = parseFloat(prev) || 0;
                let newValue = num + adjustment;
                newValue = Math.max(-180, Math.min(180, newValue));
                return newValue.toString();
            });
        };

        const handleIncrement = () => adjustValue(1);
        const handleDecrement = () => adjustValue(-1);

        return (
            <div className="relative w-14 h-14">
                <input
                    type="text"
                    inputMode="numeric"
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    className="w-full h-full bg-gray-700 text-white rounded-full text-center text-sm font-semibold focus:outline-none border border-white shadow-md"
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
                    {isLoading ? (
                        <Loader 
                            size={40} 
                            className="text-gray-400 animate-spin"
                            style={{
                                filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))',
                            }}
                        />
                    ) : (
                        <Download 
                            size={40} 
                            className="text-gray-400 cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-lg"
                            style={{
                                filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))',
                            }}
                            onClick={handleDownload}
                        />
                    )}
                </div>
                <InputWithButtons value={east} setValue={setEast} placeholder="E" vertical={false} />
            </div>
            <InputWithButtons value={south} setValue={setSouth} placeholder="S" />
            <button
                type="submit"
                className="bg-black bg-opacity-50 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 focus:outline-none focus:shadow-outline flex items-center justify-center text-xs"
                disabled={!isValidCoordinate(north) || !isValidCoordinate(south) || !isValidCoordinate(east) || !isValidCoordinate(west)}
            >
                <Maximize size={18} className="mr-2" />
                Zoom to Region
            </button>
        </form>
    );
});


export default RegionSelector;