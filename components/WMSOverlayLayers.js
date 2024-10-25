// import React, { useMemo, useState, useEffect, useRef } from 'react';
// import { WMSTileLayer, useMap } from 'react-leaflet';

// const WMSOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
//     const [currentLayer, setCurrentLayer] = useState(null);
//     const [nextLayer, setNextLayer] = useState(null);
//     const [opacity, setOpacity] = useState(1);
//     const [isNextLayerLoaded, setIsNextLayerLoaded] = useState(false);
//     const fadeIntervalRef = useRef(null);
//     const tileLoadCountRef = useRef(0);
//     const expectedTilesRef = useRef(0);
//     const preTransitionRef = useRef(null);
//     const map = useMap();

//     const overlayTypeMap = {
//         sst: 'sst',
//         so: 'so',
//         thetao: 'thetao',
//         zos: 'zos',
//         speed: 'speed'
//     };

//     const overlayType = useMemo(() => {
//         return overlayTypeMap[activeOverlay] || 'sst';
//     }, [activeOverlay]);

//     const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
//     const baseDateObj = useMemo(() => new Date(baseDate), [baseDate]);

//     const leadDay = useMemo(() => {
//         return Math.floor((selectedDateObj - baseDateObj) / (1000 * 60 * 60 * 24));
//     }, [selectedDateObj, baseDateObj]);

//     const layerName = useMemo(() => {
//         const formatDate = (date) => {
//             return date.toISOString().split('T')[0].replace(/-/g, '');
//         };
        
//         const formattedBaseDate = formatDate(baseDateObj);
//         return `XiHe-App:${leadDay}_${depth}_${formattedBaseDate}_${overlayType}.tiff`;
//     }, [leadDay, depth, baseDateObj, overlayType]);

//     const wmsParams = useMemo(() => ({
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         tiled: true,
//         width: 256,
//         height: 256,
//         timestamp: new Date().getTime()
//     }), []);

//     const calculateExpectedTiles = () => {
//         const bounds = map.getBounds();
//         const zoom = map.getZoom();
//         const tileSize = 256;
        
//         const northWest = map.project(bounds.getNorthWest(), zoom);
//         const southEast = map.project(bounds.getSouthEast(), zoom);
        
//         const tilesX = Math.ceil((southEast.x - northWest.x) / tileSize);
//         const tilesY = Math.ceil((southEast.y - northWest.y) / tileSize);
        
//         return tilesX * tilesY;
//     };

//     const handleTileLoad = () => {
//         tileLoadCountRef.current += 1;
//         const loadProgress = tileLoadCountRef.current / expectedTilesRef.current;
        
//         // Start showing next layer when at least 50% of tiles are loaded
//         if (loadProgress >= 0.5 && !isNextLayerLoaded) {
//             setIsNextLayerLoaded(true);
//         }
//     };

//     // Start pre-transition (dimming current layer) when next layer is requested
//     const startPreTransition = () => {
//         if (preTransitionRef.current) cancelAnimationFrame(preTransitionRef.current);
//         let startTime = null;
        
//         const animate = (currentTime) => {
//             if (!startTime) startTime = currentTime;
//             const elapsed = currentTime - startTime;
//             const duration = 500; // Slower pre-transition
            
//             const progress = Math.min(elapsed / duration, 1);
//             // Gentle easing for pre-transition
//             const easing = progress;
            
//             // Don't dim completely, keep at 0.4 opacity minimum
//             setOpacity(Math.max(0.4, 1 - (easing * 0.6)));
            
//             if (!isNextLayerLoaded && progress < 1) {
//                 preTransitionRef.current = requestAnimationFrame(animate);
//             }
//         };
        
//         preTransitionRef.current = requestAnimationFrame(animate);
//     };

//     // Handle main transition when next layer is loaded
//     const startMainTransition = () => {
//         if (fadeIntervalRef.current) cancelAnimationFrame(fadeIntervalRef.current);
//         if (preTransitionRef.current) cancelAnimationFrame(preTransitionRef.current);
        
//         let startTime = null;
        
//         const animate = (currentTime) => {
//             if (!startTime) startTime = currentTime;
//             const elapsed = currentTime - startTime;
//             const duration = 300; // Fast main transition
            
//             const progress = Math.min(elapsed / duration, 1);
//             const easing = progress < 0.5
//                 ? 4 * progress * progress * progress
//                 : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
//             setOpacity(Math.max(0, 1 - easing));
            
//             if (progress < 1) {
//                 fadeIntervalRef.current = requestAnimationFrame(animate);
//             } else {
//                 setCurrentLayer(nextLayer);
//                 setNextLayer(null);
//                 setIsNextLayerLoaded(false);
//                 setOpacity(1);
//                 tileLoadCountRef.current = 0;
//             }
//         };
        
//         fadeIntervalRef.current = requestAnimationFrame(animate);
//     };

//     useEffect(() => {
//         if (layerName !== currentLayer) {
//             tileLoadCountRef.current = 0;
//             expectedTilesRef.current = calculateExpectedTiles();
//             setIsNextLayerLoaded(false);
//             setNextLayer(layerName);
//             startPreTransition(); // Start dimming current layer immediately
//         }
//     }, [layerName, currentLayer]);

//     useEffect(() => {
//         if (isNextLayerLoaded) {
//             startMainTransition();
//         }
//     }, [isNextLayerLoaded]);

//     useEffect(() => {
//         return () => {
//             if (fadeIntervalRef.current) cancelAnimationFrame(fadeIntervalRef.current);
//             if (preTransitionRef.current) cancelAnimationFrame(preTransitionRef.current);
//         };
//     }, []);

//     if (!activeOverlay) return null;

//     return (
//         <>
//             {currentLayer && (
//                 <WMSTileLayer
//                     key={`current-${currentLayer}`}
//                     url="http://34.229.93.55:8080/geoserver/wms"
//                     layers={currentLayer}
//                     opacity={opacity}
//                     {...wmsParams}
//                 />
//             )}
//             {nextLayer && (
//                 <WMSTileLayer
//                     key={`next-${nextLayer}`}
//                     url="http://34.229.93.55:8080/geoserver/wms"
//                     layers={nextLayer}
//                     opacity={Math.min(1, (1 - opacity) * 2)} // Smoother fade-in
//                     {...wmsParams}
//                     eventHandlers={{
//                         tileload: handleTileLoad
//                     }}
//                 />
//             )}
//         </>
//     );
// };

// export default WMSOverlayLayers;




import React, { useMemo, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WMSOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const map = useMap();
    const layerRef = useRef(null);

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

    useEffect(() => {
        // Remove existing layer if it exists
        if (layerRef.current) {
            map.removeLayer(layerRef.current);
        }

        // Create WMTS layer
        const newLayer = L.tileLayer(
            `http://34.229.93.55:8080/geoserver/gwc/service/wmts?` +
            'SERVICE=WMTS' +
            '&REQUEST=GetTile' +
            '&VERSION=1.0.0' +
            `&LAYER=${layerName}` +
            '&STYLE=raster' +
            '&TILEMATRIXSET=EPSG:900913' +
            '&TILEMATRIX=EPSG:900913:{z}' +
            '&TILEROW={y}' +
            '&TILECOL={x}' +
            '&FORMAT=image/png', {
                tileSize: 256,
                maxZoom: 20,
                crossOrigin: true
            }
        );

        // Add the layer to the map
        newLayer.addTo(map);
        layerRef.current = newLayer;

        // Cleanup function
        return () => {
            if (layerRef.current) {
                map.removeLayer(layerRef.current);
            }
        };
    }, [map, layerName]);

    return null;
};

export default WMSOverlayLayers;