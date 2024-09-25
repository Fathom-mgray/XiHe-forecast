import React, { useState } from 'react';
import { Map, Sun, Moon } from 'lucide-react';

const MapStyleSelector = ({ selectedMapLayer, handleMapLayerChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleOpen = () => setIsOpen(!isOpen);

    const mapStyles = [
        { id: 'default', icon: <Map size={16} />, label: 'Default' },
        { id: 'light', icon: <Sun size={16} />, label: 'Light' },
        { id: 'dark', icon: <Moon size={16} />, label: 'Dark' }
    ];

    const selectedStyle = mapStyles.find(style => style.id === selectedMapLayer);

    return (
        <div className="relative">
            <button
                onClick={toggleOpen}
                className="bg-black bg-opacity-50 p-3 rounded-full shadow-md hover:bg-opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                aria-label="Select map style"
            >
                {React.cloneElement(selectedStyle.icon, { className: 'text-white' })}
            </button>
            {isOpen && (
                <div className="absolute left-0 mt-2 w-20 bg-black bg-opacity-50 rounded-md shadow-lg overflow-hidden z-10">
                    <div className="py-1">
                        {mapStyles.map((style) => (
                            <button
                                key={style.id}
                                onClick={() => {
                                    handleMapLayerChange(style.id);
                                    setIsOpen(false);
                                }}
                                className="flex items-center w-full px-2 py-1 text-xs text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
                            >
                                {React.cloneElement(style.icon, { className: 'text-white', size: 14 })}
                                <span className="ml-1">{style.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapStyleSelector;