import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';

const SliderComponent = ({ isSalinityOverlayVisible, onDateChange }) => {
    const [sliderValue, setSliderValue] = useState([0]);
    const [baseDate, setBaseDate] = useState(new Date());
    const [sliderDate, setSliderDate] = useState(new Date());
    const [depth, setDepth] = useState(0);

    const handleDepthChange = (event) => {
        setDepth(Number(event.target.value));
      };

    useEffect(() => {
        console.log('Base date changed:', baseDate);
        // Update slider date when base date changes
        setSliderDate(new Date(baseDate));
        setSliderValue([0]);
    }, [baseDate]);

    useEffect(() => {
        console.log('Slider date changed:', sliderDate);
        // Notify parent component when slider date changes
        onDateChange(sliderDate);
    }, [sliderDate, onDateChange]);

    const getMaxDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getMinDate = () => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - 13);
        return minDate.toISOString().split('T')[0];
    };

    const handleBaseDateChange = (e) => {
        const newDate = new Date(e.target.value);
        if (!isNaN(newDate.getTime())) {
            console.log('Base date input changed:', newDate);
            setBaseDate(newDate);
        }
    };

    const handleSliderChange = (newValue) => {
        console.log('Slider value changed:', newValue);
        setSliderValue(newValue);
        const newDate = new Date(baseDate);
        newDate.setDate(newDate.getDate() + newValue[0]);
        setSliderDate(newDate);
    };

    const generateDates = () => {
        return Array.from({ length: 14 }, (_, i) => {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + i);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
    };

    const dates = generateDates();

    return (
        <div className="fixed bottom-4 left-4 z-50 w-[80rem] space-y-4">

<div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-xs">
          <span className="text-white font-semibold whitespace-nowrap">Depth:</span>
          <input
            type="number"
            value={depth}
            onChange={handleDepthChange}
            min={0}
            max={23}
            className="bg-transparent px-2 py-1 text-white w-16"
          />
        </div>
   
        <div className="flex items-center space-x-2 bg-black bg-opacity-30 px-3 rounded-full w-fit text-xs">
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
    
      
      <div className="bg-black bg-opacity-30 p-2 rounded-full">
        <div>
          <Slider
            defaultValue={[0]}
            max={13}
            step={1}
            value={sliderValue}
            onValueChange={handleSliderChange}
            className="w-full"
          />
        </div>
        
        {/* <div className="text-center text-white bg-black bg-opacity-50 rounded-full py-1 px-3">
          Selected Date: {sliderDate.toLocaleDateString()}
        </div> */}
      </div>
      <div className="flex justify-between mb-2">
          {dates.map((date, index) => (
            <span key={index} className="text-xs">{date}</span>
          ))}
        </div>
    </div>
    );
};

export default SliderComponent;