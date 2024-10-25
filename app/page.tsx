"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import { X, Thermometer, Droplet, ArrowUpDown, Wind, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const SeaSurfaceTemperatureMap = dynamic(() => import("../components/SSTMap"), {
  ssr: false,
});

const InputWithButtons = ({ value, setValue, placeholder, vertical = true }) => {
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
        className="w-full h-full bg-white/10 backdrop-blur-sm text-white rounded-full text-center text-xs font-semibold focus:outline-none"
      />
      {vertical ? (
        <>
          <button type="button" onClick={handleIncrement} className="absolute top-0 left-0 right-0 h-4 flex items-center justify-center">
            <ChevronUp size={12} color="white" />
          </button>
          <button type="button" onClick={handleDecrement} className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center">
            <ChevronDown size={12} color="white" />
          </button>
        </>
      ) : (
        <>
          <button type="button" onClick={handleDecrement} className="absolute top-0 bottom-0 left-0 w-4 flex items-center justify-center">
            <ChevronLeft size={12} color="white" />
          </button>
          <button type="button" onClick={handleIncrement} className="absolute top-0 bottom-0 right-0 w-4 flex items-center justify-center">
            <ChevronRight size={12} color="white" />
          </button>
        </>
      )}
    </div>
  );
};

export default function Home() {
  const [showBanner, setShowBanner] = useState(() => {
    // Check if all required coordinates exist in session storage
    const hasAllCoordinates = 
      sessionStorage.getItem('north') && 
      sessionStorage.getItem('south') && 
      sessionStorage.getItem('east') && 
      sessionStorage.getItem('west');
    
    return !hasAllCoordinates; // Show banner if coordinates are missing
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInitialSetupDone, setIsInitialSetupDone] = useState(false);

  // Initialize coordinates from session storage
  const [north, setNorth] = useState(() => sessionStorage.getItem('north') || '');
  const [south, setSouth] = useState(() => sessionStorage.getItem('south') || '');
  const [east, setEast] = useState(() => sessionStorage.getItem('east') || '');
  const [west, setWest] = useState(() => sessionStorage.getItem('west') || '');
  
  // Initialize date from session storage or set to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const [date, setDate] = useState(() => {
    const storedDate = sessionStorage.getItem('baseDate');
    return storedDate || yesterday.toISOString().split('T')[0];
  });

  useEffect(() => {
    if (showBanner) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    // Store coordinates in session storage even if they're empty
    sessionStorage.setItem('north', north);
    sessionStorage.setItem('south', south);
    sessionStorage.setItem('east', east);
    sessionStorage.setItem('west', west);
    
    // Store base date in session storage
    sessionStorage.setItem('baseDate', date);
    
    setIsInitialSetupDone(true);
    setShowBanner(false);
}, [north, south, east, west, date]);

  const handleClose = useCallback(() => {
    setIsInitialSetupDone(true);
    setShowBanner(false);
  }, []);

  return (
    <div>
      {showBanner ? (
        <div className="relative h-screen transition-opacity duration-500 ease-out opacity-100">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('images/ship_back.webp')" }}
          ></div>

          <div className="absolute inset-0 bg-black opacity-30"></div>

          <div className="absolute inset-0 flex flex-col items-center justify-start pt-20">
            {/* Title and Logo Section */}
            <div 
              className={`flex flex-col items-center transition-all duration-1000 ease-in-out mb-8 ${
                isExpanded ? 'transform -translate-y-0 scale-75' : 'translate-y-32'
              }`}
            >
              <h1 className={`text-white font-bold animate-slide-up transition-all duration-1000 ${
                isExpanded ? 'text-6xl' : 'text-6xl'
              }`}>
                Welcome to Ocean Forecast System
              </h1>

              <div className={`flex items-center justify-center mt-4 animate-slide-up transition-all duration-1000 ${
                isExpanded ? 'scale-90' : ''
              }`}>
                <span className={`text-gray-300 mr-4 transition-all duration-1000 ${
                  isExpanded ? 'text-3xl' : 'text-4xl'
                }`}>by</span>
                <img
                  src="images/logo1.png"
                  alt="Fathom Science Logo"
                  className={`mr-2 transition-all duration-1000 ${
                    isExpanded ? 'w-8 h-8' : 'w-12 h-12'
                  }`}
                />
                <span className={`text-gray-300 transition-all duration-500 ${
                  isExpanded ? 'text-3xl' : 'text-4xl'
                }`}>Fathom Science</span>
              </div>
            </div>

            {/* Parameter Boxes Section */}
            <div 
              className={`grid grid-cols-4 gap-2 px-6 w-full max-w-2xl transition-all duration-1000 delay-500 ease-in-out mb-16 ${
                isExpanded 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'opacity-0 transform translate-y-10 pointer-events-none'
              }`}
            >
              {/* Temperature Box */}
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-white">
                  <Thermometer className="w-4.5 h-4.5 mb-0.5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold">Temperature</h3>
                  <p className="text-[8px] opacity-80 mt-0.5">Sea Surface Temperature</p>
                </div>
              </div>

              {/* Salinity Box */}
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-white">
                  <Droplet className="w-4.5 h-4.5 mb-0.5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold">Salinity</h3>
                  <p className="text-[8px] opacity-80 mt-0.5">Ocean Salt Content</p>
                </div>
              </div>

              {/* Height Box */}
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-white">
                  <ArrowUpDown className="w-4.5 h-4.5 mb-0.5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold">Height</h3>
                  <p className="text-[8px] opacity-80 mt-0.5">Sea Surface Height</p>
                </div>
              </div>

              {/* Speed Box */}
              <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg hover:bg-white/20 transition-all cursor-pointer group">
                <div className="flex flex-col items-center text-white">
                  <Wind className="w-4.5 h-4.5 mb-0.5 group-hover:scale-110 transition-transform" />
                  <h3 className="text-sm font-semibold">Speed</h3>
                  <p className="text-[8px] opacity-80 mt-0.5">Current Velocity</p>
                </div>
              </div>
            </div>

            {/* Coordinate Input Section */}
            <div className={`flex flex-col items-center space-y-3 mb-6 transition-all duration-1000 ${
              isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <InputWithButtons value={north} setValue={setNorth} placeholder="N" />
              <div className="flex justify-between items-center w-48">
                <InputWithButtons value={west} setValue={setWest} placeholder="W" vertical={false} />
                <InputWithButtons value={east} setValue={setEast} placeholder="E" vertical={false} />
              </div>
              <InputWithButtons value={south} setValue={setSouth} placeholder="S" />
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full w-fit">
                <span className="text-white text-sm font-semibold">Date:</span>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-transparent text-white text-xs px-2 py-1"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="mt-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full px-6 py-2 text-xs font-semibold transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="transition-opacity duration-1000 ease-in opacity-100">
          <SeaSurfaceTemperatureMap />
        </div>
      )}
    </div>
  );
}