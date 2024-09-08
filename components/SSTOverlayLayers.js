import React, { useEffect, useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import L from 'leaflet';

const SSTOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const bounds = useMemo(() => [
        L.latLngBounds(L.latLng(0, -180), L.latLng(83, -30)),
        L.latLngBounds(L.latLng(0, -30), L.latLng(83, 60)),
        L.latLngBounds(L.latLng(0, 60), L.latLng(83, 180)),
        L.latLngBounds(L.latLng(-78, -180), L.latLng(0, -60)),
        L.latLngBounds(L.latLng(-78, -60), L.latLng(0, 20)),
        L.latLngBounds(L.latLng(-78, 20), L.latLng(0, 180))
    ], []);

    const generateImageUrls = useMemo(() => {
        // Calculate the date one day before the base date
        const urlDate = new Date(baseDate);
        urlDate.setDate(urlDate.getDate() - 1);
        const urlDateString = urlDate.toISOString().split('T')[0].replace(/-/g, '');

        // Calculate lead days starting from 1
        const leadDays = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24)) + 1;
        const leadString = leadDays.toString().padStart(2, '0');

        const overlayTypeMap = {
            sst: 'sst',
            salinity: 'so',
            thetaO: 'thetao'
        };
        const overlayType = overlayTypeMap[activeOverlay] || 'sst';
        const depthString = `${depth}m`;

        const urls = Array.from({ length: 6 }, (_, i) => {
            const sectionNumber = i + 1;
            return `https://fathom-xihe-app.s3.amazonaws.com/XiHe_model_outputs/temp_outputs/${urlDateString}_lead${leadString}_${overlayType}_${depthString}_section_${sectionNumber}.png`;
        });

        console.log('Generated new image URLs:', urls);
        return urls;
    }, [selectedDate, baseDate, depth, activeOverlay]);

    useEffect(() => {
        console.log('Component updated with new props:', { selectedDate, baseDate, depth, activeOverlay });
    }, [selectedDate, baseDate, depth, activeOverlay]);

    if (!activeOverlay) {
        console.log('No overlay active');
        return null;
    }

    return (
        <>
            {generateImageUrls.map((url, index) => (
                <ImageOverlay
                    key={`${activeOverlay}-${index}`}
                    url={url}
                    bounds={bounds[index]}
                    zIndex={0}
                />
            ))}
        </>
    );
};

export default React.memo(SSTOverlayLayers);