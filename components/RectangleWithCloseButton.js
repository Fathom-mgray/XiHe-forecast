import React, { useRef } from 'react';
import { Rectangle, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';

const RectangleWithCloseButton = ({ bounds, onRemove }) => {
    const map = useMap();
    const markerRef = useRef(null);

    const northEast = L.latLng(bounds[1]);
    const southWest = L.latLng(bounds[0]);
    const buttonPosition = [northEast.lat, northEast.lng];

    const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
            <button style="
                width: 24px;
                height: 24px;
                background-color: rgba(0, 0, 0, 0.5);
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                border: none;
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `,
        iconSize: [24, 24],
        iconAnchor: [0, 24],
    });

    return (
        <>
            <Rectangle 
                bounds={bounds} 
                pathOptions={{ 
                    color: 'black', 
                    weight: 2, 
                    opacity: 0.5, 
                    fill: false 
                }} 
            />
            <Marker 
                position={buttonPosition} 
                icon={customIcon}
                eventHandlers={{
                    click: (e) => {
                        L.DomEvent.stopPropagation(e);
                        onRemove();
                    }
                }}
                ref={markerRef}
            />
        </>
    );
};

export default RectangleWithCloseButton;