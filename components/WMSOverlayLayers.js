import React, { useMemo, useEffect } from 'react';
import { WMSTileLayer } from 'react-leaflet';

const WMSOverlayLayers = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const overlayTypeMap = {
        sst: 'sst',
        so: 'so',
        thetao: 'thetao',
        zos: 'zos',
        speed: 'speed'
    };

    console.log('Dates:', { baseDate, selectedDate });

    const overlayType = useMemo(() => {
        return overlayTypeMap[activeOverlay] || 'sst';
    }, [activeOverlay]);

    const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
    const baseDateObj = useMemo(() => new Date(baseDate), [baseDate]);

    const dateDiff = useMemo(() => {
        return Math.floor((selectedDateObj - baseDateObj) / (1000 * 60 * 60 * 24));
    }, [selectedDateObj, baseDateObj]);

    const layerName = useMemo(() => {
        const formatDate = (date) => {
            return date.toISOString().split('T')[0].replace(/-/g, '');
        };
        
        const formattedSelectedDate = formatDate(selectedDateObj);
        const formattedBaseDate = formatDate(baseDateObj);

        const name = `XiHe-App:${formattedBaseDate}_${dateDiff}_${formattedBaseDate}_${overlayType}.tiff`;
        console.log('Layer Name:', name);
        return name;
    }, [selectedDateObj, dateDiff, baseDateObj, overlayType]);

    useEffect(() => {
        const url = `http://34.229.93.55:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&format=image/png&transparent=true`;
        console.log('WMS URL:', url);
    }, [layerName]);

    if (!activeOverlay) {
        return null;
    }

    return (
        <WMSTileLayer
            key={layerName}
            url="http://34.229.93.55:8080/geoserver/wms"
            layers={layerName}
            format="image/png"
            transparent={true}
            version="1.1.0"
        />
    );
};

export default WMSOverlayLayers;



// import React, { useMemo } from 'react';
// import { TileLayer } from 'react-leaflet';

// const WMSOverlayLayers = ({ activeOverlay }) => {
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

//     // Construct the layer name based on your specifications
//     const layerName = useMemo(() => {
//         const date = '20240905'; // Fixed date for the example
//         return `XiHe-App:${date}_${overlayType}`;
//     }, [overlayType]);

//     // WMTS URL
//     const wmtsUrl = `http://localhost:8080/geoserver/gwc/service/wmts?`;

//     if (!activeOverlay) {
//         return null;
//     }

//     return (
//         <TileLayer
//             url={`${wmtsUrl}SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=${layerName}&STYLE=&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png`}
//             maxZoom={18} // Adjust based on your WMTS settings
//             tileSize={256} // Set according to your WMTS configuration
//             attribution="Tiles &copy; <Your Attribution Here>" // Add appropriate attribution
//         />
//     );
// };

// export default WMSOverlayLayers;


// import React, { useMemo } from 'react';
// import { WMSTileLayer } from 'react-leaflet';

// const WMSLayerComponent = ({ selectedDate, baseDate, depth, activeOverlay }) => {
//     // Using hardcoded WMTS layer 'XiHe-App:20240905_thetao'
//     const wmtsLayerName = 'XiHe-App:20240905_thetao';

//     const wmtsURL = useMemo(() => {
//         return `http://localhost:8080/geoserver/gwc/service/wmts?service=WMTS&version=1.0.0&request=GetTile&layer=${wmtsLayerName}&tilematrixSet=EPSG:4326&format=image/png&tilematrix={z}&tilecol={x}&tilerow={y}`;
//     }, []);

//     console.log('WMTS URL:', wmtsURL);

//     return (
//         <WMSTileLayer
//             key={wmtsLayerName}
//             url={wmtsURL}
//             layers={wmtsLayerName}
//             format="image/png"
//             transparent={true}
//             version="1.0.0"
//         />
//     );
// };

// export default WMSLayerComponent;
