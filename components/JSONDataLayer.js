import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMapEvents, CircleMarker, Popup, useMap } from 'react-leaflet';

const JSONDataLayer = () => {
    const [jsonData, setJsonData] = useState(null);
    const [error, setError] = useState(null);
    const [clickedPoint, setClickedPoint] = useState(null);
    const [showCircle, setShowCircle] = useState(false);
    const popupRef = useRef(null);
    const map = useMap();

    // Function to fetch the JSON data
    const fetchJSONData = useCallback(async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/get-json-data');
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
    }, []);

    useEffect(() => {
        fetchJSONData();
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
        // Check if the click event originated from a UI control or if it's a synthetic event
        if (e.originalEvent && e.originalEvent.synthetic) {
            return;
        }

        const isUIControl = e.originalEvent && (
            e.originalEvent.target.closest('.leaflet-control') ||
            e.originalEvent.target.closest('button') ||
            e.originalEvent.target.closest('input') ||
            e.originalEvent.target.closest('.custom-ui-element')
        );

        if (isUIControl) {
            return;
        }

        const { lat, lng } = e.latlng;
        const nearestPoint = findNearestPoint(lat, lng);
        if (nearestPoint) {
            setClickedPoint(nearestPoint);
            setShowCircle(true);
            
            // Open popup programmatically
            if (popupRef.current) {
                popupRef.current.openOn(map);
            }

            // Set a timeout to hide the circle after 500ms
            setTimeout(() => {
                setShowCircle(false);
            }, 500);
        }
    }, [findNearestPoint, map]);

    useMapEvents({
        click: handleMapClick,
    });

    if (error) {
        return <div>Error: {error}</div>;
    }

    return clickedPoint ? (
        <>
            {showCircle && (
                <CircleMarker 
                    center={[clickedPoint.lat, clickedPoint.lng]}
                    pathOptions={{ fillColor: 'white', fillOpacity: 1, color: 'white', weight: 2 }}
                    radius={5}
                />
            )}
            <Popup
                position={[clickedPoint.lat, clickedPoint.lng]}
                ref={popupRef}
            >
                <div>
                    <p>Latitude: {clickedPoint.lat.toFixed(4)}</p>
                    <p>Longitude: {clickedPoint.lng.toFixed(4)}</p>
                    <p style={{fontSize:'1rem', fontWeight:'bold'}}>Value: {clickedPoint.value === 'nan' || clickedPoint.value === 'N/A' ? 'N/A' : Number(clickedPoint.value).toFixed(4)}</p>
                </div>
            </Popup>
        </>
    ) : null;
};

export default React.memo(JSONDataLayer);