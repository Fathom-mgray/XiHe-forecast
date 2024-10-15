import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useMap, Popup, CircleMarker } from 'react-leaflet';

const TemperaturePopup = ({ baseDate, selectedDate, activeOverlay, onToggleLeadDaysResults, depth}) => {
    const [clickedPoint, setClickedPoint] = useState(null);
    const [leadDaysData, setLeadDaysData] = useState(null);
    const map = useMap();
    const popupRef = useRef(null);

    const handleMapClick = useCallback(async (e) => {
        const { lat, lng } = e.latlng;

        // Ignore clicks on UI controls
        if (e.originalEvent && (
            e.originalEvent.target.closest('.leaflet-control') ||
            e.originalEvent.target.closest('button') ||
            e.originalEvent.target.closest('input') ||
            e.originalEvent.target.closest('.custom-ui-element')
        )) {
            return;
        }

        // Format the baseDate to 'YYYY-MM-DD'
        const formattedBaseDate = baseDate.toISOString().split('T')[0];
        console.log('Formatted Base Date:', formattedBaseDate);
        console.log(depth)

        // Calculate the lead day based on selectedDate and baseDate
        const leadDay = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));

        try {
            // API call with specific lead_day
            const response = await fetch(`http://54.147.36.134:5000/get_at_point?lat=${lat}&lon=${lng}&date=${formattedBaseDate}&lead_day=${leadDay}&overlay=${activeOverlay}&depth=${depth}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch temperature data');
            }
            
            const data = await response.json();
            console.log('Temperature data:', data);
            

            setClickedPoint({
                lat,
                lng,
                value: data.data,
                error: data.error
            });

            if (popupRef.current) {
                popupRef.current.openOn(map);
            }

            // Fetch lead days data asynchronously
            fetchLeadDaysData(lat, lng, formattedBaseDate);

        } catch (error) {
            console.error('Error fetching data:', error);
            setClickedPoint({ lat, lng, error: 'Failed to fetch data' });
        }
    }, [map, baseDate, selectedDate, activeOverlay]);

    const fetchLeadDaysData = async (lat, lng, formattedBaseDate) => {
        try {
            const leadDaysResponse = await fetch(`http://54.147.36.134:5000/get_all_lead_days?lat=${lat}&lon=${lng}&base_date=${formattedBaseDate}&overlay=${activeOverlay}&depth=${depth}`);
            
            if (!leadDaysResponse.ok) {
                throw new Error('Failed to fetch lead days data');
            }

            const leadDaysData = await leadDaysResponse.json();
            console.log('Lead days data:', leadDaysData);
            setLeadDaysData(leadDaysData.data_values);
            // Update the parent component with the new lead days data
            onToggleLeadDaysResults(leadDaysData.data_values);
        } catch (error) {
            console.error('Error fetching lead days data:', error);
            // Don't update clickedPoint or show error for lead days data
        }
    };

    useEffect(() => {
        map.on('click', handleMapClick);
        return () => {
            map.off('click', handleMapClick);
        };
    }, [map, handleMapClick]);

    const handleClosePopup = () => {
        setClickedPoint(null);
        setLeadDaysData(null);
        if (popupRef.current && popupRef.current._source) {
            popupRef.current._source.remove();
        }
        onToggleLeadDaysResults(null);
    };

    const handleToggleLeadDays = () => {
        if (leadDaysData) {
            console.log("Toggling lead days, data:", leadDaysData);
            onToggleLeadDaysResults(leadDaysData);
        } else {
            console.log("No lead days data available");
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
                        <div className="flex flex-col text-[10px] mr-1 px-1 py-0.5 w-10">
                            <div>{clickedPoint.lat.toFixed(2)}</div>
                            <div>{clickedPoint.lng.toFixed(2)}</div>
                        </div>
                        <div className="bg-black w-[1px] h-[110px]"></div>
                        <div className="rounded-r-full left-0 bg-black bg-opacity-50 text-white text-lg font-semibold w-40 flex items-center justify-between pr-2">
                            <div className='ml-10'>
                                {clickedPoint.error ? 'Error' : formatValue(clickedPoint.value, getUnitByOverlay(activeOverlay))}
                            </div>
                            <button onClick={handleToggleLeadDays} disabled={!leadDaysData}>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className="h-5 w-5" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="white"
                                    opacity={leadDaysData ? 1 : 0.5}
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M19 9l-7 7-7-7" 
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default React.memo(TemperaturePopup);