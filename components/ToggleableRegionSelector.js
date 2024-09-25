import React, { useState } from 'react';
import RegionSelector from './RegionSelector';

const ToggleableRegionSelector = ({ onRegionSelect }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    return (
        <div>
            <style>
                {`
                    @keyframes gradientFlow {
                        0% {
                            background-position: 0% 50%;
                        }
                        50% {
                            background-position: 100% 50%;
                        }
                        100% {
                            background-position: 0% 50%;
                        }
                    }

                    .gradient-bg {
                        background: linear-gradient(to right, #1e3a8a, #10b981); /* Dark Blue to Red to Green */
                        background-size: 200% 200%;
                        animation: gradientFlow 5s ease infinite;
                    }
                `}
            </style>
            <div className="flex justify-end">
                <button
                    onClick={toggleVisibility}
                    className={`w-48 mt-5 mx-2 px-4 py-2 text-white text-sm font-semibold rounded-full transition-all duration-200 gradient-bg
                                hover:from-blue-800 hover:to-green-500`}
                    style={{
                        // border:"1px solid gray",
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
                <RegionSelector onRegionSelect={onRegionSelect} />
            </div>
        </div>
    );
};

export default ToggleableRegionSelector;
