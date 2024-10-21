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

const TemperaturePopup = ({ baseDate, selectedDate, activeOverlay, onToggleLeadDaysResults, depth}) => {
    const [clickedPoint, setClickedPoint] = useState(null);
    const [leadDaysData, setLeadDaysData] = useState(null);
    const [isLoadingLeadDays, setIsLoadingLeadDays] = useState(false);
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
                error: data.error,
                formattedBaseDate
            });

            if (popupRef.current) {
                popupRef.current.openOn(map);
            }

            // Reset lead days data when a new point is clicked
            setLeadDaysData(null);

        } catch (error) {
            console.error('Error fetching data:', error);
            setClickedPoint({ lat, lng, error: 'Failed to fetch data' });
        }
    }, [map, baseDate, selectedDate, activeOverlay, depth]);

    const fetchLeadDaysData = async () => {
        if (!clickedPoint || isLoadingLeadDays) return;

        setIsLoadingLeadDays(true);
        try {
            const leadDaysResponse = await fetch(`http://54.147.36.134:5000/get_all_lead_days?lat=${clickedPoint.lat}&lon=${clickedPoint.lng}&base_date=${clickedPoint.formattedBaseDate}&overlay=${activeOverlay}&depth=${depth}`);
            
            if (!leadDaysResponse.ok) {
                throw new Error('Failed to fetch lead days data');
            }

            const leadDaysData = await leadDaysResponse.json();
            console.log('Lead days data:', leadDaysData);
            setLeadDaysData(leadDaysData.data_values);
            onToggleLeadDaysResults(leadDaysData.data_values);
        } catch (error) {
            console.error('Error fetching lead days data:', error);
            setLeadDaysData({ error: 'Failed to fetch lead days data' });
        } finally {
            setIsLoadingLeadDays(false);
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
            console.log("Fetching lead days data");
            fetchLeadDaysData();
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
                                <div className=" opacity-60" style={{fontSize:'11px'}}>
                                    {/* Display lat, lon with N/S and E/W, smaller font */}
                                    {Math.abs(clickedPoint.lat).toFixed(2)}° {clickedPoint.lat > 0 ? 'N' : 'S'}, { } 
                                    {Math.abs(clickedPoint.lng).toFixed(2)}° {clickedPoint.lng > 0 ? 'E' : 'W'}
                                </div>
                            </div>

                            <LoadingButton 
                                onClick={handleToggleLeadDays}
                                isLoading={isLoadingLeadDays}
                                hasData={!!leadDaysData}
                            />
                        </div>
                    </div>
                </div>
            </Popup>
        </>
    );
};

export default React.memo(TemperaturePopup);