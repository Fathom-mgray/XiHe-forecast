import React from 'react';

const ToggleButton = ({ active, setActive, imageSrc, name }) => {
    return (
        <button 
            onClick={() => setActive()}
            className="flex items-center justify-between rounded-full py-1 px-1 transition-all duration-300 my-1 mx-2 w-fit"
            style={{
                backgroundColor: active ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)',
                color: active ? 'rgba(255, 255, 255)' : 'rgba(0, 0, 0)',
                boxShadow: active 
                    ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)' 
                    : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
                transform: active ? 'translateY(-1px)' : 'none',
            }}
        >
            <span className="mr-1 pl-2 text-xs text-white font-semibold whitespace-nowrap">
                {name || 'Weather radar'}
            </span>
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ml-2">
                <img 
                    src={imageSrc || "/api/placeholder/24/24"} 
                    alt={name || "Weather radar"}
                    className="w-full h-full object-cover"
                />
            </div>
        </button>
    );
};

export default React.memo(ToggleButton);