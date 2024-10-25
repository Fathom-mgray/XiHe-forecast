import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';

const SliderComponent = ({ onDateChange, onBaseDateChange, onDepthChange, activeOverlay, baseDate: propBaseDate, selectedDate: propSelectedDate, isLeadDaysVisible  }) => {
    console.log('Raw propBaseDate received:', propBaseDate);
    const [sliderValue, setSliderValue] = useState([0]);
    const [baseDate, setBaseDate] = useState(propBaseDate || new Date());
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());
    const [depth, setDepth] = useState(0);
    const [dateLabels, setDateLabels] = useState([]);
    const [showDepth, setShowDepth] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const transitionTimeoutRef = useRef(null);
    const cycleCompletedRef = useRef(false);

    useEffect(() => {
        if (propBaseDate) {
            console.log('Base date 1', propBaseDate)
            const newBaseDate = new Date(propBaseDate);
            setBaseDate(newBaseDate);
            setSelectedDate(newBaseDate);
            setSliderValue([0]);
            updateDateLabels(newBaseDate);
        }
    }, [propBaseDate]);

    useEffect(() => {
        if (propSelectedDate) {
            const newSelectedDate = new Date(propSelectedDate);
            setSelectedDate(newSelectedDate);
            const dayDiff = Math.floor((newSelectedDate - baseDate) / (1000 * 60 * 60 * 24));
            setSliderValue([Math.min(Math.max(dayDiff, 0), 9)]);
        }
    }, [propSelectedDate, baseDate]);

    const updateDateLabels = useCallback((date) => {
        const labels = Array.from({ length: 10 }, (_, i) => {
            const labelDate = new Date(date);
            labelDate.setDate(labelDate.getDate() + i);
            return labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        setDateLabels(labels);
    }, []);

    useEffect(() => {
        updateDateLabels(baseDate);
    }, [baseDate, updateDateLabels]);

    useEffect(() => {
        const shouldShowDepth = activeOverlay === 'so' || activeOverlay === 'thetao' || activeOverlay === 'speed';
        setShowDepth(shouldShowDepth);

        if (!shouldShowDepth) {
            setDepth(0);
            onDepthChange(0);
        }
    }, [activeOverlay, onDepthChange]);

    const advanceSlider = useCallback(() => {
        setSliderValue(prevValue => {
            let newValue = prevValue[0] + 1;
            if (newValue > 9) {
                newValue = 0;  // Loop back to the start
                cycleCompletedRef.current = true;
            }
            const newDate = new Date(baseDate);
            newDate.setDate(newDate.getDate() + newValue);
            setSelectedDate(newDate);
            onDateChange(newDate);
            
            return [newValue];
        });
    }, [baseDate, onDateChange]);

    useEffect(() => {
        if (isPlaying) {
            const advanceWithTransition = () => {
                advanceSlider();
                if (cycleCompletedRef.current) {
                    setIsPlaying(false);
                    cycleCompletedRef.current = false;
                } else {
                    // Set a timeout for the next advancement
                    transitionTimeoutRef.current = setTimeout(advanceWithTransition, 4000);  // 4 seconds between each date
                }
            };
            // Start the first advancement
            transitionTimeoutRef.current = setTimeout(advanceWithTransition, 4000);
        } else {
            clearTimeout(transitionTimeoutRef.current);
        }

        return () => clearTimeout(transitionTimeoutRef.current);
    }, [isPlaying, advanceSlider]);

    const handleDepthChange = useCallback((event) => {
        const newDepth = Number(event.target.value);
        setDepth(newDepth);
        onDepthChange(newDepth);
    }, [onDepthChange]);

    const handleBaseDateChange = useCallback((e) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);
        if (!isNaN(newDate.getTime())) {
            setBaseDate(newDate);
            setSelectedDate(newDate);
            onBaseDateChange(newDate);
            onDateChange(newDate);
            setSliderValue([0]);
            updateDateLabels(newDate);
        }
    }, [onBaseDateChange, onDateChange, updateDateLabels]);

    const handleSliderChange = useCallback((newValue) => {
        setSliderValue(newValue);
        const newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() + Math.floor(newValue[0]));
        setSelectedDate(newDate);
        onDateChange(newDate);
    }, [baseDate, onDateChange]);

    const togglePlay = useCallback(() => {
        setIsPlaying(prev => !prev);
        cycleCompletedRef.current = false;  // Reset cycle completion when play is toggled
    }, []);

    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinDate = () => {
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 1);
        return minDate.toISOString().split('T')[0];
    };

    const formatDateLabel = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        return `${month}\n${day}`;
    };

    return (
        <div className={`
        w-[75%] max-w-[85rem]  space-y-4
        transition-all duration-300 ease-in-out
         p-4  // Added background and padding for visibility
    `}>
            <div className="flex flex-col items-start gap-2">
                <div className={`
                    transition-all duration-300 ease-in-out
                    ${showDepth 
                        ? 'opacity-100' 
                        : 'opacity-0 pointer-events-none'
                    }
                `}>
                    {isTooltipVisible && (
                        <div 
                            className="absolute bottom-full my-3 bg-white text-black text-bold text-xs italic py-2 px-3 whitespace-nowrap rounded-full shadow-lg"
                            style={{
                                maxWidth: '200px',
                                width: 'max-content'
                            }}
                        >
                            You can enter the depth here
                        </div>
                    )}
                    <div className="flex items-center space-x-2 bg-opacity-30 rounded-full w-fit text-sm p-1 shadow-md" style={{backgroundColor:'rgba(13, 38, 57,0.7)'}}>
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
                            <select
                                value={depth}
                                onChange={handleDepthChange}
                                className="bg-transparent text-white appearance-none pr-2"
                            >
                                <option value={0}>Surface</option>
                                <option value={10}>Middle</option>
                                <option value={22}>Bottom</option>
                            </select>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="white"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M19 9l-7 7-7-7" 
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-sm shadow-md">
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
            <div className="flex items-center space-x-4">
                <button
                    onClick={togglePlay}
                    className="hover:bg-opacity-30 text-white rounded-full p-2 transition-colors duration-200 shadow-md flex-shrink-0"
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
                        className="w-full transition-all duration-1000 ease-linear"
                    />
                    <div className="relative w-full mt-2">
                        <div className="flex justify-between absolute w-full" style={{ left: '0.5%', right: '0.5%' }}>
                            {dateLabels.map((label, index) => {
                                const date = new Date(baseDate);
                                date.setDate(date.getDate() + index);
                                return (
                                    <div 
                                        key={index} 
                                        className={`text-xs ${Math.floor(sliderValue[0]) === index ? 'font-bold' : ''} text-center`}
                                        style={{ 
                                            position: 'absolute', 
                                            left: `${(index / 9) * 100}%`, 
                                            transform: 'translateX(-50%)',
                                            width: 'clamp(30px, 2.5vw, 40px)',
                                        }}
                                    >
                                        {formatDateLabel(date).split('\n').map((part, i) => (
                                            <div key={i} className="whitespace-nowrap">{part}</div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(SliderComponent);