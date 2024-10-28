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







import React, { useMemo, useEffect, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WMSOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
  const map = useMap();
  const currentLayerRef = useRef(null);
  const nextLayerRef = useRef(null);
  const transitionTimeoutRef = useRef(null);
  const [transitioning, setTransitioning] = useState(false);
  
  const overlayTypeMap = {
    sst: 'sst',
    so: 'so',
    thetao: 'thetao',
    zos: 'zos',
    speed: 'speed'
  };

  const overlayType = useMemo(() => overlayTypeMap[activeOverlay] || 'sst', [activeOverlay]);
  const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
  const baseDateObj = useMemo(() => new Date(baseDate), [baseDate]);
  
  const leadDay = useMemo(() => 
    Math.floor((selectedDateObj - baseDateObj) / (1000 * 60 * 60 * 24)), 
    [selectedDateObj, baseDateObj]
  );

  const getLayerName = (leadDayOffset = 0) => {
    const formatDate = (date) => date.toISOString().split('T')[0].replace(/-/g, '');
    const formattedBaseDate = formatDate(baseDateObj);
    return `XiHe-App:${leadDay + leadDayOffset}_${depth}_${formattedBaseDate}_${overlayType}.tiff`;
  };

  const layerName = useMemo(() => getLayerName(), [leadDay, depth, baseDateObj, overlayType]);
  const nextLayerName = useMemo(() => getLayerName(1), [leadDay, depth, baseDateObj, overlayType]);

  const createLayer = (name, options = {}) => {
    return L.tileLayer(
      `http://34.229.93.55:8080/geoserver/gwc/service/wmts?` +
      'SERVICE=WMTS' +
      '&REQUEST=GetTile' +
      '&VERSION=1.0.0' +
      `&LAYER=${name}` +
      '&STYLE=raster' +
      '&TILEMATRIXSET=EPSG:900913' +
      '&TILEMATRIX=EPSG:900913:{z}' +
      '&TILEROW={y}' +
      '&TILECOL={x}' +
      '&FORMAT=image/png', 
      {
        tileSize: 256,
        maxZoom: 20,
        opacity: options.opacity ?? 0,
        crossOrigin: true,
        layerName: name,
        ...options
      }
    );
  };

  const prefetchNextLayer = () => {
    const nextName = getLayerName(1);
    
    // Don't prefetch if we already have this layer
    if (nextLayerRef.current?.options.layerName === nextName) {
      return;
    }

    if (nextLayerRef.current) {
      map.removeLayer(nextLayerRef.current);
    }

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    const nextLayer = createLayer(nextName, { opacity: 0 });
    nextLayerRef.current = nextLayer;
    
    // Add to map but keep invisible
    nextLayer.addTo(map);

    // Calculate tile coordinates for current viewport
    const northWest = bounds.getNorthWest();
    const southEast = bounds.getSouthEast();
    
    const tileBounds = {
      minX: Math.floor((northWest.lng + 180) / 360 * Math.pow(2, zoom)),
      maxX: Math.ceil((southEast.lng + 180) / 360 * Math.pow(2, zoom)),
      minY: Math.floor((1 - Math.log(Math.tan(northWest.lat * Math.PI / 180) + 1 / Math.cos(northWest.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)),
      maxY: Math.ceil((1 - Math.log(Math.tan(southEast.lat * Math.PI / 180) + 1 / Math.cos(southEast.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
    };

    // Prefetch tiles
    for (let x = tileBounds.minX; x <= tileBounds.maxX; x++) {
      for (let y = tileBounds.minY; y <= tileBounds.maxY; y++) {
        const url = nextLayer.getTileUrl({ x, y, z: zoom });
        new Image().src = url;
      }
    }
  };

  useEffect(() => {
    // Keep current layer visible until new one is ready
    if (currentLayerRef.current) {
      currentLayerRef.current.setOpacity(1);
    }

    const updateLayer = async () => {
      // Check if we have a prefetched layer that matches what we need
      let newLayer;
      if (nextLayerRef.current?.options.layerName === layerName) {
        newLayer = nextLayerRef.current;
        nextLayerRef.current = null;
      } else {
        // Create new layer if no matching prefetched layer
        newLayer = createLayer(layerName, { opacity: 0 });
        newLayer.addTo(map);
      }

      // Wait for tiles to load
      await new Promise((resolve) => {
        if (newLayer.isLoading()) {
          newLayer.once('load', resolve);
          setTimeout(resolve, 2000); // Increased timeout for better reliability
        } else {
          resolve();
        }
      });

      // Fade in new layer while keeping old layer visible
      let opacity = 0;
      const fadeInterval = setInterval(() => {
        opacity = Math.min(1, opacity + 0.3);
        newLayer.setOpacity(opacity);
        
        if (opacity >= 1) {
          clearInterval(fadeInterval);
          
          // Only remove old layer after new one is fully visible
          if (currentLayerRef.current && currentLayerRef.current !== newLayer) {
            map.removeLayer(currentLayerRef.current);
          }
          
          currentLayerRef.current = newLayer;
          setTransitioning(false);
          
          // Prefetch next layer after current transition is complete
          prefetchNextLayer();
        }
      }, 50);

      return () => {
        clearInterval(fadeInterval);
      };
    };

    if (!transitioning) {
      setTransitioning(true);
      updateLayer();
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [map, layerName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentLayerRef.current) {
        map.removeLayer(currentLayerRef.current);
      }
      if (nextLayerRef.current) {
        map.removeLayer(nextLayerRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [map]);

  return null;
};

export default WMSOverlayLayers;