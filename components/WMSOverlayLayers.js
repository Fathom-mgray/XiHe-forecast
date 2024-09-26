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

        const name = `XiHe-App:${leadDay}_${depth}_${formattedBaseDate}_${overlayType}.tiff`;
        console.log('Generated Layer Name:', name);
        return name;
    }, [leadDay, depth, baseDateObj, overlayType]);

    useEffect(() => {
        const url = `http://34.229.93.55:8080/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=${layerName}&format=image/jpeg&transparent=true`;
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
            format="image/jpeg"
            transparent={true}
            version="1.1.0"
        />
    );
};

export default WMSOverlayLayers;




// import React from 'react';
// import { WMSTileLayer } from 'react-leaflet';

// const WMSOverlayLayers = ({ activeOverlay }) => {
//     const layerName = "XiHe-App:20240905_sst";

//     console.log('Using Layer:', layerName);

//     if (!activeOverlay) {
//         return null;
//     }

//     return (
//         <WMSTileLayer
//             key={layerName}
//             url="http://localhost:8080/geoserver/wms"
//             layers={layerName}
//             format="image/jpeg"
//             transparent={true}
//             version="1.1.0"
//         />
//     );
// };

// export default WMSOverlayLayers;