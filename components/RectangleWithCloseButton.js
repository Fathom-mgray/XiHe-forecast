import React, { useEffect, useRef } from 'react';
import { Rectangle, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { X } from 'lucide-react';

const RectangleWithCloseButton = ({ bounds, onRemove }) => {
    const map = useMap();
    const markerRef = useRef(null);
    const labelsRef = useRef([]);

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

    const formatCoordinate = (coord, isLatitude) => {
        const abs = Math.abs(coord);
        const deg = Math.floor(abs);
        const min = Math.floor((abs - deg) * 60);
        const sec = ((abs - deg - min / 60) * 3600).toFixed(2);
        const dir = isLatitude ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
        return `${deg}°${min}'${sec}"${dir}`;
    };

    const createLabel = (position, latText, lonText, className) => {
        const label = L.marker(position, {
            icon: L.divIcon({
                className: 'coordinate-label',
                html: `
                    <div class="${className}" style="padding:5px">
                        <div class="lat-label">${latText}</div>
                        <div class="lon-label">${lonText}</div>
                    </div>
                `,
                iconSize: [120, 60],
                iconAnchor: [60, 30]
            })
        });
        return label;
    };

    useEffect(() => {
        // Remove old labels
        labelsRef.current.forEach(label => label.remove());
        labelsRef.current = [];

        // Create new labels
        const nwLabel = createLabel(
            [northEast.lat, southWest.lng],
            formatCoordinate(northEast.lat, true),
            formatCoordinate(southWest.lng, false),
            'nw-label'
        );
        const neLabel = createLabel(
            [northEast.lat, northEast.lng],
            formatCoordinate(northEast.lat, true),
            formatCoordinate(northEast.lng, false),
            'ne-label'
        );
        const swLabel = createLabel(
            [southWest.lat, southWest.lng],
            formatCoordinate(southWest.lat, true),
            formatCoordinate(southWest.lng, false),
            'sw-label'
        );
        const seLabel = createLabel(
            [southWest.lat, northEast.lng],
            formatCoordinate(southWest.lat, true),
            formatCoordinate(northEast.lng, false),
            'se-label'
        );

        [nwLabel, neLabel, swLabel, seLabel].forEach(label => {
            label.addTo(map);
            labelsRef.current.push(label);
        });

        return () => {
            labelsRef.current.forEach(label => label.remove());
        };
    }, [bounds, map]);

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