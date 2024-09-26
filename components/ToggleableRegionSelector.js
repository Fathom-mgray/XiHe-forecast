import React, { useState } from 'react';
import RegionSelector from './RegionSelector';

const ToggleableRegionSelector = ({ onRegionSelect, onZoomToRegion }) => {
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
                        background: white;
                        border-radius: 9999px;
                        z-index: -1;
                    }
                `}
            </style>
            <div className="flex justify-end">
                <button
                    onClick={toggleVisibility}
                    className="w-48 mt-5 mx-2 px-4 py-2 text-black font-semibold text-sm rounded-full transition-all duration-200 gradient-border-button"
                    style={{
                        boxShadow: isVisible
                            ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                    }}
                >
                    {isVisible ? 'Hide' : 'Show'} Region Selector
                </button>
            </div>
            <br/>
            
            <div className={`mt-4 ${isVisible ? 'block' : 'hidden'}`}>
                <RegionSelector 
                    onRegionSelect={onRegionSelect} 
                    onZoomToRegion={onZoomToRegion}
                />
            </div>
        </div>
    );
};

export default ToggleableRegionSelector;