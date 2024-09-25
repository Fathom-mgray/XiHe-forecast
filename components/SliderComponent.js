import React, { useState, useCallback, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Play, Pause } from 'lucide-react';

const SliderComponent = ({ onDateChange, onBaseDateChange, onDepthChange, activeOverlay, baseDate: propBaseDate, selectedDate: propSelectedDate }) => {
    const [sliderValue, setSliderValue] = useState([0]);
    const [baseDate, setBaseDate] = useState(propBaseDate || new Date());
    const [selectedDate, setSelectedDate] = useState(propSelectedDate || new Date());
    const [depth, setDepth] = useState(0);
    const [dateLabels, setDateLabels] = useState([]);
    const [showDepth, setShowDepth] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        console.log("propBaseDate changed:", propBaseDate);
        if (propBaseDate) {
            const newBaseDate = new Date(propBaseDate);
            console.log("Setting new base date:", newBaseDate);
            setBaseDate(newBaseDate);
            setSelectedDate(newBaseDate);
            setSliderValue([0]);
            updateDateLabels(newBaseDate);
        }
    }, [propBaseDate]);

    useEffect(() => {
        console.log("propSelectedDate changed:", propSelectedDate);
        if (propSelectedDate) {
            const newSelectedDate = new Date(propSelectedDate);
            console.log("Setting new selected date:", newSelectedDate);
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
        setShowDepth(activeOverlay === 'so' || activeOverlay === 'thetao' || activeOverlay === 'speed');
    }, [activeOverlay]);

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setSliderValue(prevValue => {
                    const newValue = prevValue[0] + 0.1;  // Smaller increment for smoother movement
                    if (newValue > 9) {
                        setIsPlaying(false);
                        return [0];
                    }
                    const newDate = new Date(baseDate);
                    newDate.setDate(newDate.getDate() + Math.floor(newValue));
                    console.log("Auto-playing, new selected date:", newDate);
                    setSelectedDate(newDate);
                    onDateChange(newDate);
                    return [newValue];
                });
            }, 200); // Change every 200ms for smoother animation
        }
        return () => clearInterval(interval);
    }, [isPlaying, baseDate, onDateChange]);

    const handleDepthChange = useCallback((event) => {
        const newDepth = Number(event.target.value);
        console.log("Depth changed to:", newDepth);
        setDepth(newDepth);
        onDepthChange(newDepth);
    }, [onDepthChange]);

    const handleBaseDateChange = useCallback((e) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        const newDate = new Date(year, month - 1, day);  // month is 0-indexed in JS Date
        if (!isNaN(newDate.getTime())) {
            console.log("Manually changing base date to:", newDate);
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
        console.log("Slider changed, new selected date:", newDate);
        setSelectedDate(newDate);
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

    const formatDateLabel = (date) => {
        const day = date.getDate();
        const month = date.toLocaleString('en-US', { month: 'short' });
        return `${month}\n${day}`;
    };

    return (
        <div className="fixed bottom-5 left-4 z-50 w-[85rem] space-y-4">
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
                                <input
                                    type="number"
                                    value={depth}
                                    onChange={handleDepthChange}
                                    min={0}
                                    max={23}
                                    className="bg-transparent text-white appearance-none"
                                    style={{ '-moz-appearance': 'textfield' }}
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white">m</span>
                            </div>
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
            <div className="mt-2 flex items-center space-x-4">
                <button
                    onClick={togglePlay}
                    className="hover:bg-opacity-30 text-white rounded-full p-2 transition-colors duration-200 mb-2 shadow-md"
                    style={{backgroundColor:'rgba(13, 38, 57,0.7)'}}
                >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <div className="w-full">
                    <Slider
                        defaultValue={[0]}
                        max={9}
                        step={0.1}  // Smaller step for smoother movement
                        value={sliderValue}
                        onValueChange={handleSliderChange}
                        className="w-full transition-all duration-1000 ease-linear"  // Added smooth transition
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
                                            width: '40px',  // Fixed width for consistency
                                        }}
                                    >
                                        {formatDateLabel(date).split('\n').map((part, i) => (
                                            <div key={i}>{part}</div>
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