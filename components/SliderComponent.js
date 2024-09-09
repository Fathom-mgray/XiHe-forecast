import React, { useState, useCallback, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';

const SliderComponent = ({ onDateChange, onBaseDateChange, onDepthChange, activeOverlay }) => {
    const [sliderValue, setSliderValue] = useState([0]);
    const [baseDate, setBaseDate] = useState(new Date());
    const [depth, setDepth] = useState(0);
    const [dateLabels, setDateLabels] = useState([]);
    const [showDepth, setShowDepth] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const updateDateLabels = useCallback(() => {
        const labels = Array.from({ length: 10 }, (_, i) => {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        setDateLabels(labels);
    }, [baseDate]);

    useEffect(() => {
        updateDateLabels();
    }, [baseDate, updateDateLabels]);

    useEffect(() => {
        setShowDepth(activeOverlay === 'salinity' || activeOverlay === 'thetaO' || activeOverlay === 'zos' || activeOverlay === 'speed');
    }, [activeOverlay]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setSliderValue(prevValue => {
                    const newValue = prevValue[0] + 1;
                    if (newValue > 9) {
                        setIsPlaying(false);
                        return [0];
                    }
                    const newDate = new Date(baseDate);
                    newDate.setDate(newDate.getDate() + newValue);
                    onDateChange(newDate);
                    return [newValue];
                });
            }, 1000); // Change every second
        }
        return () => clearInterval(interval);
    }, [isPlaying, baseDate, onDateChange]);

    const handleDepthChange = useCallback((event) => {
        const newDepth = Number(event.target.value);
        setDepth(newDepth);
        onDepthChange(newDepth);
    }, [onDepthChange]);

    const handleBaseDateChange = useCallback((e) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            setBaseDate(newDate);
            onBaseDateChange(newDate);
            setSliderValue([0]);
            onDateChange(newDate);
        }
    }, [onBaseDateChange, onDateChange]);

    const handleSliderChange = useCallback((newValue) => {
        setSliderValue(newValue);
        const newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() + newValue[0]);
        onDateChange(newDate);
    }, [baseDate, onDateChange]);

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinDate = () => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 1);
        return minDate.toISOString().split('T')[0];
    };

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[85rem] space-y-4">
            <div className="">
                <div className="my-2 overflow-visible">
                    <div
                        className={`
                            transition-all duration-300 ease-in-out
                            ${showDepth 
                                ? 'translate-x-0 opacity-100' 
                                : '-translate-x-full opacity-0'
                            }
                        `}
                    >
                        {isTooltipVisible && (
                            <div 
                                className="absolute bottom-full my-3 bg-white text-black text-bold text-xs italic py-2 px-3 whitespace-nowrap rounded-full"
                                style={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    maxWidth: '200px',
                                    width: 'max-content'
                                }}
                            >
                                You can enter the depth here
                            </div>
                        )}
                        <div className="flex items-center space-x-2 bg-opacity-30 px-3 rounded-full w-fit text-sm" style={{backgroundColor:'rgba(13, 38, 57,0.7)'}}>
                            <div 
                                className="relative"
                                onMouseEnter={() => setIsTooltipVisible(true)}
                                onMouseLeave={() => setIsTooltipVisible(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-white font-semibold whitespace-nowrap">Depth:</span>
                            <div className="relative flex items-center">
                                <input
                                    type="number"
                                    value={depth}
                                    onChange={handleDepthChange}
                                    min={0}
                                    max={23}
                                    className="bg-transparent p-1 text-white appearance-none"
                                    style={{ '-moz-appearance': 'textfield' }}
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white">m</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-sm" style={{backgroundColor:'rgba(39, 95, 76,0.5)'}}>
                    <span className="text-white font-semibold whitespace-nowrap">Base Date:</span>
                    <input
                        type="date"
                        value={baseDate.toISOString().split('T')[0]}
                        onChange={handleBaseDateChange}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="bg-transparent px-2 py-1 text-white"
                    />
                </div>
            </div>
            <div className="mt-2 flex items-center space-x-4">
                <button
                    onClick={togglePlay}
                    className="hover:bg-opacity-30 text-white rounded-full p-2 transition-colors duration-200 mb-4"
                    style={{backgroundColor:'rgba(13, 38, 57,0.7)'}}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="w-full">
                    <Slider
                        defaultValue={[0]}
                        max={9}
                        step={1}
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        className="w-full"
                    />
                    <div className="relative w-full mt-4">
                        <div className="flex justify-between absolute w-full" style={{ left: '0.5%', right: '0.5%' }}>
                            {dateLabels.map((label, index) => (
                                <span 
                                    key={index} 
                                    className={`text-xs ${index === sliderValue[0] ? 'font-bold' : ''}`}
                                    style={{ 
                                        position: 'absolute', 
                                        left: `${(index / 9) * 100}%`, 
                                        transform: 'translateX(-50%)' 
                                    }}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SliderComponent);