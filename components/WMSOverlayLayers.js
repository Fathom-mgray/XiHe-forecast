import React, { useMemo, useState, useEffect, useRef } from 'react';
import { WMSTileLayer, useMap } from 'react-leaflet';

const WMSOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const [currentLayer, setCurrentLayer] = useState(null);
    const [nextLayer, setNextLayer] = useState(null);
    const [opacity, setOpacity] = useState(1);
    const fadeIntervalRef = useRef(null);
    const map = useMap();

    const overlayTypeMap = {
        sst: 'sst',
        so: 'so',
        thetao: 'thetao',
        zos: 'zos',
        speed: 'speed'
    };

    const overlayType = useMemo(() => {
        return overlayTypeMap[activeOverlay] || 'sst';
    }, [activeOverlay]);

    const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
    const baseDateObj = useMemo(() => new Date(baseDate), [baseDate]);

    const leadDay = useMemo(() => {
        return Math.floor((selectedDateObj - baseDateObj) / (1000 * 60 * 60 * 24));
    }, [selectedDateObj, baseDateObj]);

    const layerName = useMemo(() => {
        const formatDate = (date) => {
            return date.toISOString().split('T')[0].replace(/-/g, '');
        };
        
        const formattedBaseDate = formatDate(baseDateObj);

        return `XiHe-App:${leadDay}_${depth}_${formattedBaseDate}_${overlayType}.tiff`;
    }, [leadDay, depth, baseDateObj, overlayType]);

    const wmsParams = useMemo(() => ({
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        tiled: true,
        width: 256,
        height: 256,
        timestamp: new Date().getTime()
    }), []);

    useEffect(() => {
        if (layerName !== currentLayer) {
            // Pre-load the next layer
            setNextLayer(layerName);
            
            // Start fade out after a short delay
            setTimeout(() => {
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                
                fadeIntervalRef.current = setInterval(() => {
                    setOpacity((prevOpacity) => {
                        if (prevOpacity <= 0.05) {
                            clearInterval(fadeIntervalRef.current);
                            setCurrentLayer(layerName);
                            setNextLayer(null);
                            return 1; // Reset to full opacity for the new layer
                        }
                        return prevOpacity - 0.05;
                    });
                }, 50);
            }, 200); // Short delay to allow next layer to load
        }

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [layerName, currentLayer]);

    // Preload images
    useEffect(() => {
        if (nextLayer) {
            const image = new Image();
            image.src = `http://34.229.93.55:8080/geoserver/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=${nextLayer}&SRS=EPSG:4326&STYLES=&WIDTH=256&HEIGHT=256&BBOX=-180,-90,180,90`;
        }
    }, [nextLayer]);

    if (!activeOverlay) {
        return null;
    }

    return (
        <>
            {currentLayer && (
                <WMSTileLayer
                    key={`current-${currentLayer}`}
                    url="http://34.229.93.55:8080/geoserver/wms"
                    layers={currentLayer}
                    opacity={opacity}
                    {...wmsParams}
                />
            )}
            {nextLayer && (
                <WMSTileLayer
                    key={`next-${nextLayer}`}
                    url="http://34.229.93.55:8080/geoserver/wms"
                    layers={nextLayer}
                    opacity={Math.max(0, 1 - opacity)}
                    {...wmsParams}
                />
            )}
        </>
    );
};

export default WMSOverlayLayers;