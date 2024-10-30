// import React, { useState, useCallback, useEffect, useRef } from 'react';
// import { useMap, Popup, CircleMarker } from 'react-leaflet';

// const LoadingButton = ({ onClick, isLoading, hasData }) => (
//     <button onClick={onClick} disabled={isLoading}>
//         <svg 
//             xmlns="http://www.w3.org/2000/svg" 
//             className="h-5 w-5" 
//             fill="none" 
//             viewBox="0 0 24 24" 
//             stroke="white"
//             opacity={1}
//         >
//             <path 
//                 strokeLinecap="round" 
//                 strokeLinejoin="round" 
//                 strokeWidth={2} 
//                 d="M3 17h4v4H3v-4zm6-8h4v12h-4V9zm6-4h4v16h-4V5z" 
//             />
//         </svg>
//     </button>
// );

// const TemperaturePopup = ({ baseDate, selectedDate, activeOverlay, onToggleLeadDaysResults, depth }) => {
//     const [clickedPoint, setClickedPoint] = useState(null);
//     const [leadDaysData, setLeadDaysData] = useState(null);
//     const [isLoadingLeadDays, setIsLoadingLeadDays] = useState(false);
//     const map = useMap();
//     const popupRef = useRef(null);

//     const handleMapClick = useCallback(async (e) => {
//         // First, check if any drawing tools are active
//         const hasActiveDrawTools = document.querySelector('.leaflet-draw-toolbar .leaflet-draw-draw-polygon.leaflet-draw-toolbar-button-enabled') ||
//                                  document.querySelector('.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-draw-toolbar-button-enabled') ||
//                                  document.querySelector('.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-draw-toolbar-button-enabled');

//         if (hasActiveDrawTools) {
//             return; // Exit if drawing tools are active
//         }

//         const { lat, lng } = e.latlng;

//         // Ignore clicks on UI controls
//         if (e.originalEvent && (
//             e.originalEvent.target.closest('.leaflet-control') ||
//             e.originalEvent.target.closest('button') ||
//             e.originalEvent.target.closest('input') ||
//             e.originalEvent.target.closest('.custom-ui-element') ||
//             e.originalEvent.target.closest('.leaflet-draw-section')
//         )) {
//             return;
//         }

//         // Format the baseDate to 'YYYY-MM-DD'
//         const formattedBaseDate = baseDate.toISOString().split('T')[0];
//         console.log('Formatted Base Date:', formattedBaseDate);
//         console.log(depth);

//         // Calculate the lead day based on selectedDate and baseDate
//         const leadDay = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));

//         try {
//             // API call with specific lead_day
//             // const response = await fetch(`http://54.147.36.134:5000/get_at_point?lat=${lat}&lon=${lng}&date=${formattedBaseDate}&lead_day=${leadDay}&overlay=${activeOverlay}&depth=${depth}`);
//             const response = await fetch(`http://127.0.0.1:5000/get_at_point?lat=${lat}&lon=${lng}&date=${formattedBaseDate}&lead_day=${leadDay}&overlay=${activeOverlay}&depth=${depth}`);
//             if (!response.ok) {
//                 throw new Error('Failed to fetch temperature data');
//             }
            
//             const data = await response.json();
//             console.log('Temperature data:', data);
            
//             setClickedPoint({
//                 lat,
//                 lng,
//                 value: data.data,
//                 error: data.error,
//                 formattedBaseDate
//             });

//             if (popupRef.current) {
//                 popupRef.current.openOn(map);
//             }

//             // Reset lead days data when a new point is clicked
//             setLeadDaysData(null);

//         } catch (error) {
//             console.error('Error fetching data:', error);
//             setClickedPoint({ lat, lng, error: 'Failed to fetch data' });
//         }
//     }, [map, baseDate, selectedDate, activeOverlay, depth]);

//     const fetchLeadDaysData = async () => {
//         if (!clickedPoint || isLoadingLeadDays) return;

//         setIsLoadingLeadDays(true);
//         try {
//             // const leadDaysResponse = await fetch(`http://54.147.36.134:5000/get_all_lead_days?lat=${clickedPoint.lat}&lon=${clickedPoint.lng}&base_date=${clickedPoint.formattedBaseDate}&overlay=${activeOverlay}&depth=${depth}`);
//             const leadDaysResponse = await fetch(`http://127.0.0.1:5000/get_all_lead_days?lat=${clickedPoint.lat}&lon=${clickedPoint.lng}&base_date=${clickedPoint.formattedBaseDate}&overlay=${activeOverlay}&depth=${depth}`);
            
//             if (!leadDaysResponse.ok) {
//                 throw new Error('Failed to fetch lead days data');
//             }

//             const leadDaysData = await leadDaysResponse.json();
//             console.log('Lead days data:', leadDaysData);
//             setLeadDaysData(leadDaysData.data_values);
//             onToggleLeadDaysResults(leadDaysData.data_values);
//         } catch (error) {
//             console.error('Error fetching lead days data:', error);
//             setLeadDaysData({ error: 'Failed to fetch lead days data' });
//         } finally {
//             setIsLoadingLeadDays(false);
//         }
//     };

//     useEffect(() => {
//         map.on('click', handleMapClick);
//         return () => {
//             map.off('click', handleMapClick);
//         };
//     }, [map, handleMapClick]);

//     const handleClosePopup = () => {
//         setClickedPoint(null);
//         setLeadDaysData(null);
//         if (popupRef.current && popupRef.current._source) {
//             popupRef.current._source.remove();
//         }
//         onToggleLeadDaysResults(null);
//     };

//     const handleToggleLeadDays = () => {
//         if (leadDaysData) {
//             console.log("Toggling lead days, data:", leadDaysData);
//             onToggleLeadDaysResults(leadDaysData);
//         } else {
//             console.log("Fetching lead days data");
//             fetchLeadDaysData();
//         }
//     };

//     const getUnitByOverlay = (overlay) => {
//         switch (overlay) {
//             case 'sst':
//             case 'thetao':
//                 return '°C';
//             case 'so':
//                 return 'PSU';
//             case 'zos':
//                 return 'm';
//             case 'speed':
//                 return 'm/s';
//             default:
//                 return '';
//         }
//     };

//     const formatValue = (value, unit) => {
//         if (value === 'nan' || value === 'N/A' || value === undefined) {
//             return 'N/A';
//         }
//         const formattedValue = Number(value).toFixed(2);
//         return `${formattedValue} ${unit}`;
//     };

//     if (!clickedPoint) return null;

//     return (
//         <>
//             <CircleMarker 
//                 center={[clickedPoint.lat, clickedPoint.lng]}
//                 radius={4}
//                 pathOptions={{ 
//                     fillColor: 'transparent',
//                     fillOpacity: 0,
//                     color: 'black',
//                     weight: 5
//                 }}
//             />
//             <Popup
//                 position={[clickedPoint.lat, clickedPoint.lng]}
//                 ref={popupRef}
//                 closeButton={false}
//                 offset={[80, 20]}
//                 className="custom-popup"
//             >
//                 <div className="relative">
//                     <button 
//                         onClick={handleClosePopup}
//                         className="absolute top-0 right-0 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
//                         style={{ transform: 'translate(50%, -50%)' }}
//                     >
//                         ×
//                     </button>
//                     <div className="flex items-start">
//                         <div className="bg-black w-[1px] h-[110px]"></div>
//                         <div className="rounded-r-full left-0 bg-black bg-opacity-50 text-white text-lg font-semibold w-40 flex items-center justify-between pr-2">
//                             <div className="ml-2 flex flex-col">
//                                 <div>
//                                     {clickedPoint.error ? 'Error' : formatValue(clickedPoint.value, getUnitByOverlay(activeOverlay))}
//                                 </div>
//                                 <div className="opacity-60" style={{fontSize:'11px'}}>
//                                     {Math.abs(clickedPoint.lat).toFixed(2)}° {clickedPoint.lat > 0 ? 'N' : 'S'}, { } 
//                                     {Math.abs(clickedPoint.lng).toFixed(2)}° {clickedPoint.lng > 0 ? 'E' : 'W'}
//                                 </div>
//                             </div>
//                             <LoadingButton 
//                                 onClick={handleToggleLeadDays}
//                                 isLoading={isLoadingLeadDays}
//                                 hasData={!!leadDaysData}
//                             />
//                         </div>
//                     </div>
//                 </div>
//             </Popup>
//         </>
//     );
// };

// export default React.memo(TemperaturePopup);



import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMap, Popup, CircleMarker } from 'react-leaflet';

const LoadingButton = ({ onClick, isLoading, hasData }) => (
    <button onClick={onClick} disabled={isLoading}>
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="white"
            opacity={1}
        >
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 17h4v4H3v-4zm6-8h4v12h-4V9zm6-4h4v16h-4V5z" 
            />
        </svg>
    </button>
);

const TemperaturePopup = ({ baseDate, selectedDate, activeOverlay, onToggleLeadDaysResults, depth }) => {
    const [clickedPoint, setClickedPoint] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const map = useMap();
    const popupRef = useRef(null);

    // Define overlays that support depth profiles
    const depthProfileOverlays = ['so', 'speed', 'thetao'];
    const hasDepthProfile = depthProfileOverlays.includes(activeOverlay);

    const getFeatureInfo = async (latlng, map, leadDayOffset = 0, depthValue = depth) => {
        const leadDay = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24)) + leadDayOffset;
        const formattedBaseDate = baseDate.toISOString().split('T')[0].replace(/-/g, '');
        
        const layerName = `XiHe-App:data_${leadDay}_${depthValue}_${formattedBaseDate}_${activeOverlay}.tiff`;
        console.log('Layer name:', layerName);
        console.log('Parameters used:', {
            leadDay,
            depth: depthValue,
            formattedBaseDate,
            activeOverlay
        });

        const point = map.latLngToContainerPoint(latlng);
        const size = map.getSize();
        
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        const geoserverUrl = 'http://34.229.93.55:8080/geoserver/wms';
        const params = new URLSearchParams({
            SERVICE: 'WMS',
            VERSION: '1.1.1',
            REQUEST: 'GetFeatureInfo',
            LAYERS: layerName,
            QUERY_LAYERS: layerName,
            INFO_FORMAT: 'application/json',
            X: Math.round(point.x),
            Y: Math.round(point.y),
            WIDTH: size.x,
            HEIGHT: size.y,
            BBOX: `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`,
            SRS: 'EPSG:4326',
            FEATURE_COUNT: 1,
            TRANSPARENT: true,
            PROPERTYNAME: 'Band5'
        });

        const url = `${geoserverUrl}?${params.toString()}`;
        console.log('GetFeatureInfo URL:', url);

        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('GeoServer response:', errorText);
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
            leadDay,
            depth: depthValue,
            value: data.features?.[0]?.properties?.Band5 ?? null
        };
    };


const FIXED_DEPTHS = [0, 10, 22];

const fetchDepthProfile = async () => {
    if (!clickedPoint || isLoading) return;

    setIsLoading(true);
    try {
        // Get lead days data first (for all overlays)
        const leadDaysPromises = Array.from({ length: 10 }, (_, i) => 
            getFeatureInfo({ lat: clickedPoint.lat, lng: clickedPoint.lng }, map, i)
        );

        const leadDaysResults = await Promise.all(leadDaysPromises);
        
        // Format lead days data
        const leadDaysData = {
            data_values: leadDaysResults.reduce((acc, { leadDay, value }) => {
                if (value !== null) {
                    acc[`lead_day_${leadDay}`] = parseFloat(value);
                }
                return acc;
            }, {}),
            lat: clickedPoint.lat,
            lon: clickedPoint.lng,
            plots: [{
                x: leadDaysResults.map(r => r.leadDay),
                y: leadDaysResults.map(r => parseFloat(r.value)),
                type: 'scatter',
                name: 'Forecast',
                mode: 'lines+markers'
            }]
        };

        let depthProfile = null;
        // Get depth data for supported overlays
        if (hasDepthProfile) {
            const leadDay = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));
            const depthPromises = FIXED_DEPTHS.map(d => 
                getFeatureInfo({ lat: clickedPoint.lat, lng: clickedPoint.lng }, map, leadDay, d)
            );

            const depthResults = await Promise.all(depthPromises);

            // Format depth data
            depthProfile = {
                x: depthResults.map(r => parseFloat(r.value)), // values
                y: depthResults.map(r => r.depth), // depths
                type: 'scatter',
                name: 'Depth Profile',
                mode: 'lines+markers',
                orientation: 'h' // horizontal plot
            };

            console.log('Depth profile data:', depthProfile);
        }

        // Store both types of data
        setProfileData({
            leadDays: leadDaysData,
            depthProfile: depthProfile
        });
        
        // Pass both to results component
        onToggleLeadDaysResults(leadDaysData.data_values, depthProfile);

    } catch (error) {
        console.error('Error fetching data:', error);
        setProfileData({ error: 'Failed to fetch data' });
    } finally {
        setIsLoading(false);
    }
};


// const fetchLeadDaysData = async () => {
//     if (!clickedPoint || isLoading) return;

//     setIsLoading(true);
//     try {
//         const leadDaysPromises = Array.from({ length: 10 }, (_, i) => 
//             getFeatureInfo({ lat: clickedPoint.lat, lng: clickedPoint.lng }, map, i)
//         );

//         const results = await Promise.all(leadDaysPromises);
        
//         const data_values = {
//             data_values: results.reduce((acc, { leadDay, value }) => {
//                 if (value !== null) {
//                     acc[`lead_day_${leadDay}`] = parseFloat(value);
//                 }
//                 return acc;
//             }, {}),
//             lat: clickedPoint.lat,
//             lon: clickedPoint.lng,
//             plots: [{
//                 x: results.map(r => r.leadDay),
//                 y: results.map(r => parseFloat(r.value)),
//                 type: 'scatter',
//                 name: 'Forecast',
//                 mode: 'lines+markers'
//             }]
//         };

//         console.log('Lead days data:', data_values);
//         setProfileData(data_values);
//         onToggleLeadDaysResults(data_values.data_values);
//     } catch (error) {
//         console.error('Error fetching lead days data:', error);
//         setProfileData({ error: 'Failed to fetch lead days data' });
//     } finally {
//         setIsLoading(false);
//     }
// };

    const handleMapClick = useCallback(async (e) => {
        const hasActiveDrawTools = document.querySelector('.leaflet-draw-toolbar .leaflet-draw-draw-polygon.leaflet-draw-toolbar-button-enabled') ||
                                 document.querySelector('.leaflet-draw-toolbar .leaflet-draw-edit-edit.leaflet-draw-toolbar-button-enabled') ||
                                 document.querySelector('.leaflet-draw-toolbar .leaflet-draw-edit-remove.leaflet-draw-toolbar-button-enabled');

        if (hasActiveDrawTools) {
            return;
        }

        const { lat, lng } = e.latlng;

        if (e.originalEvent && (
            e.originalEvent.target.closest('.leaflet-control') ||
            e.originalEvent.target.closest('button') ||
            e.originalEvent.target.closest('input') ||
            e.originalEvent.target.closest('.custom-ui-element') ||
            e.originalEvent.target.closest('.leaflet-draw-section')
        )) {
            return;
        }

        try {
            const { value } = await getFeatureInfo(e.latlng, map);
            
            setClickedPoint({
                lat,
                lng,
                value,
                formattedBaseDate: baseDate.toISOString().split('T')[0]
            });

            if (popupRef.current) {
                popupRef.current.openOn(map);
            }

            // Reset profile data when a new point is clicked
            setProfileData(null);
            onToggleLeadDaysResults(null);

        } catch (error) {
            console.error('Error fetching data:', error);
            setClickedPoint({ lat, lng, error: 'Failed to fetch data' });
        }
    }, [map, baseDate, selectedDate, activeOverlay, depth, onToggleLeadDaysResults]);

    useEffect(() => {
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, handleMapClick]);

    const handleClosePopup = () => {
        setClickedPoint(null);
        setProfileData(null);
        if (popupRef.current && popupRef.current._source) {
            popupRef.current._source.remove();
        }
        onToggleLeadDaysResults(null);
    };

    const handleToggleProfile = () => {
        if (profileData) {
            console.log("Toggling profile data:", profileData);
            if (hasDepthProfile) {
                // Pass both lead days and depth data
                onToggleLeadDaysResults(
                    profileData.leadDays.data_values,
                    profileData.depthProfile
                );
            } else {
                // Just pass lead days data for non-depth overlays
                onToggleLeadDaysResults(profileData.data_values);
            }
        } else {
            console.log("Fetching data for overlay:", activeOverlay);
            fetchDepthProfile();
        }
    };

    const getUnitByOverlay = (overlay) => {
        switch (overlay) {
            case 'sst':
            case 'thetao':
                return '°C';
            case 'so':
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
        if (value === 'nan' || value === 'N/A' || value === undefined) {
            return 'N/A';
        }
        const formattedValue = Number(value).toFixed(2);
        return `${formattedValue} ${unit}`;
    };

    if (!clickedPoint) return null;

    return (
        <>
            <CircleMarker 
                center={[clickedPoint.lat, clickedPoint.lng]}
                radius={4}
                pathOptions={{ 
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    color: 'black',
                    weight: 5
                }}
            />
            <Popup
                position={[clickedPoint.lat, clickedPoint.lng]}
                ref={popupRef}
                closeButton={false}
                offset={[80, 20]}
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
                        <div className="bg-black w-[1px] h-[110px]"></div>
                        <div className="rounded-r-full left-0 bg-black bg-opacity-50 text-white text-lg font-semibold w-40 flex items-center justify-between pr-2">
                            <div className="ml-2 flex flex-col">
                                <div>
                                    {clickedPoint.error ? 'Error' : formatValue(clickedPoint.value, getUnitByOverlay(activeOverlay))}
                                </div>
                                <div className="opacity-60" style={{fontSize:'11px'}}>
                                    {Math.abs(clickedPoint.lat).toFixed(2)}° {clickedPoint.lat > 0 ? 'N' : 'S'}, { } 
                                    {Math.abs(clickedPoint.lng).toFixed(2)}° {clickedPoint.lng > 0 ? 'E' : 'W'}
                                </div>
                            </div>
                            <LoadingButton 
                                onClick={handleToggleProfile}
                                isLoading={isLoading}
                                hasData={!!profileData}
                            />
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default React.memo(TemperaturePopup);
