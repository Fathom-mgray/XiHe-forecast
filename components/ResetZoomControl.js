// ResetZoomControl.js
import React from 'react';

const ResetZoomControl = ({ onResetZoom }) => {
    return (
        <button
            onClick={onResetZoom}
            className="bg-white text-black px-4 py-2 rounded-md shadow-md hover:bg-gray-100 transition-colors duration-200"
            style={{
                position: 'absolute',
                bottom: '20px',
                left: '10px',
                zIndex: 1000,
            }}
        >
            Reset Zoom
        </button>
    );
};

export default ResetZoomControl;