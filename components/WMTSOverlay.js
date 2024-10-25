import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const WMTSOverlay = ({ opacity = 1 }) => {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        // WMTS parameters for Web Mercator
        const wmtsParams = {
            url: `http://localhost:8080/geoserver/gwc/service/wmts`,
            layer: 'XiHe-App:sst_coverage',
            style: 'raster',
            tilematrixSet: 'EPSG:900913',  // Using Web Mercator
            format: 'image/png',
            version: '1.0.0',
            transparent: true,
            attribution: '© GeoServer',
            tileSize: 256,
            maxZoom: 20
        };

        // Calculate resolutions and scales for Web Mercator
        const getResolutions = () => {
            const resolutions = [];
            const maxResolution = 156543.03392804097;
            
            for (let i = 0; i <= 20; i++) {
                resolutions[i] = maxResolution / Math.pow(2, i);
            }
            return resolutions;
        };

        // Function to get the matrix ID based on zoom level
        const getMatrixId = (zoom) => {
            return `EPSG:900913:${zoom}`;
        };

        // Create the WMTS URL template
        const wmtsUrl = `${wmtsParams.url}?` +
            'SERVICE=WMTS' +
            '&REQUEST=GetTile' +
            `&VERSION=${wmtsParams.version}` +
            `&LAYER=${wmtsParams.layer}` +
            `&STYLE=${wmtsParams.style}` +
            `&TILEMATRIXSET=${wmtsParams.tilematrixSet}` +
            '&TILEMATRIX=' + wmtsParams.tilematrixSet + ':{z}' +
            '&TILEROW={y}' +
            '&TILECOL={x}' +
            `&FORMAT=${wmtsParams.format}`;

        // Create custom WMTS layer with proper tiling scheme
        const wmtsLayer = L.tileLayer(wmtsUrl, {
            attribution: wmtsParams.attribution,
            transparent: wmtsParams.transparent,
            opacity: opacity,
            maxZoom: wmtsParams.maxZoom,
            tileSize: wmtsParams.tileSize,
            crossOrigin: true,
            // Adjust tile coordinates for Web Mercator
            tms: false,
            // Custom function to transform tile coordinates
            tileUrlFunction: (coords) => {
                const zoom = coords.z;
                const matrixIds = getMatrixId(zoom);
                
                return wmtsUrl
                    .replace('{z}', matrixIds)
                    .replace('{y}', coords.y)
                    .replace('{x}', coords.x);
            },
            // Debug tile loading
            onError: function(e) {
                console.error('Tile loading error:', e);
                console.log('Failed URL:', e.target.src);
            }
        });

        // Add the layer to the map
        wmtsLayer.addTo(map);

        // Log example URL for debugging
        const sampleUrl = wmtsUrl
            .replace('{z}', getMatrixId(2))
            .replace('{y}', '1')
            .replace('{x}', '2');
        console.log('Sample WMTS URL:', sampleUrl);

        // Cleanup function
        return () => {
            if (map && wmtsLayer) {
                map.removeLayer(wmtsLayer);
            }
        };
    }, [map, opacity]);

    return null;
};

export default WMTSOverlay;