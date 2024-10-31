import React, { useState } from 'react';
import RegionSelector from './RegionSelector';
import { LocateOff, LocateFixed } from 'lucide-react';

const ToggleableRegionSelector = ({ depth, 
    activeOverlay, 
    baseDate, 
    selectedDate,
    onRegionSelect,
    onZoomToRegion,
    north={north},
    south={south},
    east={east},
    west={west},
    updateCoordinate }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div>
            <style>
                {`
                    @keyframes gradientFlow {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }

                    .gradient-border-button {
                        position: relative;
                        background: white;
                        z-index: 1;
                        overflow: hidden;
                        transition: opacity 0.2s ease;
                    }

                    .gradient-border-button:hover {
                        opacity: 0.8;
                    }

                    .gradient-border-button::before {
                        content: '';
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        right: -2px;
                        bottom: -2px;
                        background: linear-gradient(90deg, #1e3a8a, #10b981, #1e3a8a);
                        background-size: 200% 200%;
                        animation: gradientFlow 5s ease infinite;
                        z-index: -1;
                    }

                    .gradient-border-button::after {
                        content: '';
                        position: absolute;
                        top: 2px;
                        left: 2px;
                        right: 2px;
                        bottom: 2px;
                        // background: white;
                        border-radius: 9999px;
                        z-index: -1;
                        transition: opacity 0.2s ease;
                    }

                    .gradient-border-button:hover::after {
                        opacity: 0.9;
                    }
                `}
            </style>
            <div className="flex justify-end">
                <button
                    onClick={toggleVisibility}
                    className="mt-5 py-2 px-3 mx-2  text-white font-semibold text-xs rounded-full transition-all duration-200 gradient-border-button flex items-center"
                    style={{
                        boxShadow: isVisible
                            ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                    }}
                >
                    {isVisible ? 
                        <LocateOff className='mr-2 w-5 h-5'/> : 
                        <LocateFixed className='mr-2 w-5 h-5'/>
                    }

                    {isVisible ? 'Hide' : 'Show'} Region Selector
                </button>
            </div>
            <br/>
            
            <div className={`mt-4 ${isVisible ? 'block' : 'hidden'}`}>
                <RegionSelector 
                    onRegionSelect={onRegionSelect}
                    onZoomToRegion={onZoomToRegion}
                    depth={depth}
                    activeOverlay={activeOverlay}
                    baseDate={baseDate}
                    selectedDate={selectedDate}
                    north={north}
                    south={south}
                    east={east}
                    west={west}
                    updateCoordinate={updateCoordinate}
                />
            </div>
        </div>
    );
};

export default ToggleableRegionSelector;