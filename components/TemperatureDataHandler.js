import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useMapEvents, Popup, useMap, CircleMarker } from 'react-leaflet';
import * as GeoTIFF from 'geotiff';

const TemperatureDataHandler = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const [layerData, setLayerData] = useState(null);
    const [error, setError] = useState(null);
    const [clickedPoint, setClickedPoint] = useState(null);
    const popupRef = useRef(null);
    const map = useMap();

    console.log('Dates:', { baseDate, selectedDate });

    const overlayTypeMap = {
        sst: 'sst',
        so: 'salinity',
        thetao: 'thetaO',
        zos: 'zos',
        speed: 'speed'
    };

    const overlayType = useMemo(() => {
        return overlayTypeMap[activeOverlay] || 'sst';
    }, [activeOverlay]);

    const selectedDateObj = useMemo(() => new Date(selectedDate), [selectedDate]);
    const baseDateObj = useMemo(() => new Date(baseDate), [baseDate]);

    const dateDiff = useMemo(() => {
        return Math.floor((selectedDateObj - baseDateObj) / (1000 * 60 * 60 * 24));
    }, [selectedDateObj, baseDateObj]);

    const layerName = useMemo(() => {
        console.log(selectedDateObj, baseDateObj)
        const formatDate = (date) => {

            console.log(date)
            return date.toISOString().split('T')[0].replace(/-/g, '');
        };
        
        const formattedSelectedDate = formatDate(selectedDateObj);
        const formattedBaseDate = formatDate(baseDateObj);

        return `XiHe-App:${formattedBaseDate}_${dateDiff}_${formattedBaseDate}_${overlayType}.tiff`;
    }, [selectedDateObj, dateDiff, baseDateObj, overlayType]);

    const fetchWCSData = useCallback(async () => {
        try {
            const response = await fetch(`http://34.229.93.55:8080/geoserver/wcs?service=WCS&version=2.0.1&request=GetCoverage&coverageId=${layerName}&format=image/tiff&subset=Long(-180,180)&subset=Lat(-90,90)`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const geoTiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
            const image = await geoTiff.getImage();
            
            const data = await image.readRasters();
            const [tiePointLong, tiePointLat] = image.getOrigin();
            const [pixelWidth, pixelHeight] = image.getResolution();
            
            const fourthLayerData = data[3];
            const width = data.width;
            const height = data.height;

            setLayerData({
                values: fourthLayerData,
                width,
                height,
                tiePointLong,
                tiePointLat,
                pixelWidth,
                pixelHeight
            });
            setError(null);

            console.log("Fourth layer data extracted.");
        } catch (error) {
            console.error("Error fetching WCS data:", error);
            setLayerData(null);
            setError(`Failed to fetch data: ${error.message}`);
        }
    }, [layerName]);

    useEffect(() => {
        fetchWCSData();
        setClickedPoint(null);
        if (popupRef.current && popupRef.current._source) {
            popupRef.current._source.remove();
        }
    }, [fetchWCSData]);

    const getValueAtLatLon = useCallback((lat, lon) => {
        if (!layerData) return null;

        const { width, height, values, tiePointLong, tiePointLat, pixelWidth, pixelHeight } = layerData;

        const x = Math.floor((lon - tiePointLong) / pixelWidth);
        const y = Math.floor((tiePointLat - lat) / pixelHeight);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = y * width + x;
            return values[index];
        }
        return null;
    }, [layerData]);

    const handleMapClick = useCallback((e) => {
        if (e.originalEvent && e.originalEvent.synthetic) return;
        
        const isUIControl = e.originalEvent && (
            e.originalEvent.target.closest('.leaflet-control') ||
            e.originalEvent.target.closest('button') ||
            e.originalEvent.target.closest('input') ||
            e.originalEvent.target.closest('.custom-ui-element')
        );

        if (isUIControl) return;

        const { lat, lng } = e.latlng;
        const value = getValueAtLatLon(lat, lng);
        if (value !== null) {
            setClickedPoint({ lat, lng, value });
            if (popupRef.current) {
                popupRef.current.openOn(map);
            }
        }
    }, [getValueAtLatLon, map]);

    const handleClosePopup = () => {
        setClickedPoint(null);
        if (popupRef.current && popupRef.current._source) {
            popupRef.current._source.remove();
        }
    };

    useMapEvents({
        click: handleMapClick,
    });

    const getUnitByOverlay = (overlay) => {
        switch (overlay) {
            case 'sst':
            case 'thetaO':
                return '°C';
            case 'salinity':
                return 'PSU';
            case 'zos':
                return 'm';
            case 'speed':
                return 'm/s';
            default:
                return '';
        }
    };

    const formatValue = (value, unit) => {
        if (value === 'nan' || value === 'N/A') {
            return 'N/A';
        }
        const formattedValue = Number(value).toFixed(2);
        return `${formattedValue} ${unit}`;
    };

    if (error) {
        return <div>Error: {error}</div>;
    }

    return clickedPoint ? (
        <>
            <CircleMarker 
                center={[clickedPoint.lat, clickedPoint.lng]}
                radius={4}
                pathOptions={{ 
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    color: 'white',
                    weight: 3
                }}
            />
            <Popup
                position={[clickedPoint.lat, clickedPoint.lng]}
                ref={popupRef}
                closeButton={false}
                offset={[59, 20]}
                className="custom-popup"
            >
                <div className="relative">
                    <button 
                        onClick={handleClosePopup}
                        className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        style={{ transform: 'translate(50%, -50%)' }}
                    >
                        ×
                    </button>
                    <div className="flex items-start">
                        <div className="flex flex-col text-[10px]  mr-1 px-1 py-0.5 w-10">
                            <div>{clickedPoint.lat.toFixed(2)}</div>
                            <div>{clickedPoint.lng.toFixed(2)}</div>
                        </div>
                        <div className="bg-black w-[1px] h-[110px]"></div>
                        <div className="left-0 bg-black bg-opacity-50 text-white text-lg font-semibold w-40">
                            <div className='ml-10'>{formatValue(clickedPoint.value, getUnitByOverlay(activeOverlay))}</div>
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    ) : null;
};

export default React.memo(TemperatureDataHandler);