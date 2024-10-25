import React from 'react';

const ToggleButton = ({ active, setActive, imageSrc, name }) => {
    return (
        <button 
            onClick={() => setActive()}
            className={`
                flex items-center justify-between rounded-full
                py-1 px-1 my-1 mx-2 w-fit
                transition-all duration-300
                shadow-sm
                bg-black
                ${active 
                    ? 'bg-opacity-60 shadow-md -translate-y-0.5' 
                    : 'bg-opacity-30 hover:bg-opacity-50'
                }
            `}
        >
            <span className="mr-1 pl-2 text-xs font-semibold whitespace-nowrap text-white">
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