import React, { useState, useCallback, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const SliderComponent = ({ onDateChange, onBaseDateChange, onDepthChange, activeOverlay }) => {
    const [sliderValue, setSliderValue] = useState([0]);
    const [baseDate, setBaseDate] = useState(new Date());
    const [depth, setDepth] = useState(0);
    const [dateLabels, setDateLabels] = useState([]);
    const [showDepth, setShowDepth] = useState(false);
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

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
        setShowDepth(activeOverlay === 'salinity' || activeOverlay === 'thetaO');
    }, [activeOverlay]);

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
        <div className="fixed bottom-4 left-4 z-50 w-[80rem] space-y-4">
            <div className="">
                <div className="h-10 overflow-visible">
                    <div
                        className={`
                            transition-all duration-300 ease-in-out
                            ${showDepth 
                                ? 'translate-x-0 opacity-100' 
                                : '-translate-x-full opacity-0'
                            }
                        `}
                    >
                        <div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-sm">
                            <div 
                                className="relative"
                                onMouseEnter={() => setIsTooltipVisible(true)}
                                onMouseLeave={() => setIsTooltipVisible(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                {isTooltipVisible && (
                                    <div 
                                        className="absolute bottom-full left-0 my-2 bg-white text-black text-bold text-xs italic rounded py-2 px-2 whitespace-nowrap z-10"
                                        style={{
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            maxWidth: '200px',
                                            width: 'max-content'
                                        }}
                                    >
                                        You can enter the depth here
                                    </div>
                                )}
                            </div>
                            <span className="text-white font-semibold whitespace-nowrap">Depth:</span>
                            <div className="relative flex items-center">
                                <input
                                    type="number"
                                    value={depth}
                                    onChange={handleDepthChange}
                                    min={0}
                                    max={23}
                                    className="bg-transparent px-2 py-1 text-white w-16 appearance-none"
                                    style={{ '-moz-appearance': 'textfield' }}
                                />
                                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white">m</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-sm">
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
            <div className="mt-2">
                <Slider
                    defaultValue={[0]}
                    max={13}
                    step={1}
                    value={sliderValue}
                    onValueChange={handleSliderChange}
                    className="w-full"
                />
            </div>
            <div className="flex justify-between text-xs">
                {dateLabels.map((label, index) => (
                    <span key={index} className={index === sliderValue[0] ? 'font-bold' : ''}>{label}</span>
                ))}
            </div>
        </div>
    );
};

export default React.memo(SliderComponent);