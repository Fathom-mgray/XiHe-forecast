port React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMapEvents, Popup, useMap, CircleMarker } from 'react-leaflet';

const JSONDataLayer = ({ selectedDate, baseDate, depth, activeOverlay }) => {
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);
    const [clickedPoint, setClickedPoint] = useState(null);
    const popupRef = useRef(null);
    const map = useMap();

    const fetchJSONData = useCallback(async () => {
        try {
            const urlDate = new Date(baseDate);
            urlDate.setDate(urlDate.getDate() - 1);
            const urlDateString = urlDate.toISOString().split('T')[0].replace(/-/g, '');

            const leadDays = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24)) + 1;
            const leadString = leadDays.toString().padStart(2, '0');

            const overlayTypeMap = {
                sst: 'sst',
                salinity: 'so',
                thetaO: 'thetao',
                zos: 'zos',
                speed: 'speed'
            };
            const overlayType = overlayTypeMap[activeOverlay] || 'sst';
            const depthString = `${depth}m`;

            const url = `http://98.80.9.17:5000/get-json-data?file=XiHe_model_outputs/temp_outputs/${urlDateString}_lead${leadString}_${overlayType}_${depthString}.json`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log('Raw fetched data:', result);

            if (result.status === 'success' && result.data && result.data.features) {
                console.log('Processed data:', result.data.features);
                setJsonData(result.data.features);
                setError(null);
            } else {
                console.error('Unexpected data structure:', result);
                throw new Error('Invalid data structure');
            }
        } catch (error) {
            console.error('Error fetching JSON data:', error);
            setJsonData(null);
            setError(`Failed to fetch data: ${error.message}`);
        }
    }, [selectedDate, baseDate, depth, activeOverlay]);

    useEffect(() => {
        fetchJSONData();
        setClickedPoint(null);
        if (popupRef.current && popupRef.current._source) {
            popupRef.current._source.remove();
        }
    }, [fetchJSONData]);

    const findNearestPoint = useCallback((lat, lng) => {
        if (!jsonData || !Array.isArray(jsonData)) {
            console.log('Invalid jsonData:', jsonData);
            return null;
        }

        let nearest = null;
        let minDistance = Infinity;

        for (const feature of jsonData) {
            if (!feature.geometry || !feature.geometry.coordinates) {
                console.log('Invalid feature data:', feature);
                continue;
            }

            let coordinates = feature.geometry.coordinates;
            if (typeof coordinates === 'string') {
                try {
                    coordinates = JSON.parse(coordinates);
                } catch (error) {
                    console.log('Error parsing coordinates:', coordinates);
                    continue;
                }
            }

            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
                console.log('Invalid coordinates format:', coordinates);
                continue;
            }

            const [pointLng, pointLat] = coordinates;
            const distance = Math.sqrt(
                Math.pow(pointLat - lat, 2) + Math.pow(pointLng - lng, 2)
            );
            if (distance < minDistance) {
                minDistance = distance;
                nearest = {
                    lat: pointLat,
                    lng: pointLng,
                    value: feature.properties ? feature.properties.value : 'N/A'
                };
            }
        }

        return nearest;
    }, [jsonData]);

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
        const nearestPoint = findNearestPoint(lat, lng);
        if (nearestPoint) {
            setClickedPoint({...nearestPoint, clickLat: lat, clickLng: lng});
            if (popupRef.current) {
                popupRef.current.openOn(map);
            }
        }
    }, [findNearestPoint, map]);

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
                center={[clickedPoint.clickLat, clickedPoint.clickLng]}
                radius={4}
                pathOptions={{ fillColor: 'black', fillOpacity: 1, color: 'black', weight: 1 }}
            />
            <Popup
                position={[clickedPoint.clickLat, clickedPoint.clickLng]}
                ref={popupRef}
                closeButton={false}
                offset={[64, 17]}
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
                        <div className="flex flex-col text-[10px] text-white mr-1 px-1 py-0.5">
                            <div>{clickedPoint.lat.toFixed(2)}</div>
                            <div>{clickedPoint.lng.toFixed(2)}</div>
                        </div>
                        <div className="bg-black w-[2px] h-[110px]"></div>
                        <div className="left-0 bg-black bg-opacity-50 text-white text-lg font-semibold ">
                            <div className='mx-10'>{formatValue(clickedPoint.value, getUnitByOverlay(activeOverlay))}</div>
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    ) : null;
};

export default React.memo(JSONDataLayer);
