import React from 'react';

const ToggleButton = ({ visible, setVisible, imageSrc, name }) => {
    return (
        <button 
            onClick={() => setVisible(!visible)}
            className="flex items-center justify-between rounded-full py-1 px-1 transition-colors duration-300 my-1 mx-2 w-fit"
            style={{
                backgroundColor: visible ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)',
                color: visible ? 'rgba(255, 255, 255)' : 'rgba(0, 0, 0)',
            }}
        >
            <span className="mr-1 pl-2 text-xs text-white font-semibold whitespace-nowrap">{name || 'Weather radar'}</span>
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

export default ToggleButton;