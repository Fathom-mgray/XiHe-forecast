import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import WMSOverlayLayers from './WMSOverlayLayers';
import ToggleButton from './ToggleButton';
import NavBar from './Navbar';
import SliderComponent from './SliderComponent';
import LegendComponent from './LegendComponent';
import ToggleableRegionSelector from './ToggleableRegionSelector';
import './MapStyles.css';
import MapStyleSelector from './MapStyleSelector';
import RectangleWithCloseButton from './RectangleWithCloseButton';
import TemperaturePopup from './TemperaturePopup';
import LeadDaysResults from './LeadDaysResults';
import { Minimize} from 'lucide-react';
import WMTSOverlay from './WMTSOverlay';
import checkWMTSCapabilities from './checkWMTSCapabilities';


const SSTMap = () => {
    // Core state management
    
    const [activeOverlay, setActiveOverlay] = useState('sst');
    const [showLeadDaysResults, setShowLeadDaysResults] = useState(false);
    const [leadDaysData, setLeadDaysData] = useState([]);
    const [selectedMapLayer, setSelectedMapLayer] = useState('default');
    const [dataStatus, setDataStatus] = useState({ loading: false, dataAvailable: false });
    
    // Map configuration state
    const [initialCenter, setInitialCenter] = useState([25, -90]);
    const [initialZoom, setInitialZoom] = useState(3);
    const [depth, setDepth] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    
    // Region and coordinates state
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [north, setNorth] = useState(() => sessionStorage.getItem('north') || '');
    const [south, setSouth] = useState(() => sessionStorage.getItem('south') || '');
    const [east, setEast] = useState(() => sessionStorage.getItem('east') || '');
    const [west, setWest] = useState(() => sessionStorage.getItem('west') || '');

    const yesterday = (() => {
        const date = new Date();
        date.setDate(date.getDate() - 1); // Subtract 1 day
        date.setUTCHours(12, 0, 0, 0);    // Set to noon UTC
        return date;
    })();

    // Date management
    const [baseDate, setBaseDate] = useState(() => {
        const storedDate = sessionStorage.getItem('baseDate');
        if (storedDate) {
            const date = new Date(storedDate);
            // Set the time to noon UTC to avoid timezone issues
            date.setUTCHours(12, 0, 0, 0);
            return date;
        }
        return yesterday;
    });
    
    const [selectedDate, setSelectedDate] = useState(() => {
        // Initialize selectedDate to be the same as baseDate
        const storedDate = sessionStorage.getItem('baseDate');
        if (storedDate) {
            const date = new Date(storedDate);
            date.setUTCHours(12, 0, 0, 0);
            return date;
        }
        return yesterday;
    });


    const mapRef = useRef(null);

    // Initialize map with coordinates from session storage
    useEffect(() => {
        if (north && south && east && west) {
            const bounds = [
                [parseFloat(south), parseFloat(west)],
                [parseFloat(north), parseFloat(east)]
            ];
            setSelectedRegion(bounds);
            const centerLat = (parseFloat(north) + parseFloat(south)) / 2;
            const centerLon = (parseFloat(east) + parseFloat(west)) / 2;
            setInitialCenter([centerLat, centerLon]);
            setInitialZoom(4);
        }
    }, []);

    // Handle zoom state
    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            const handleMoveEnd = () => setIsZooming(false);
            map.on('moveend', handleMoveEnd);
            return () => map.off('moveend', handleMoveEnd);
        }
    }, []);

    // Handlers
    const handleDataStatusChange = useCallback((status) => {
        setDataStatus(status);
    }, []);

    const handleResetZoom = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.setView([25, -90], 3);
        }
    }, []);

    const clearCoordinates = useCallback(() => {
        setNorth('');
        setSouth('');
        setEast('');
        setWest('');
        sessionStorage.removeItem('north');
        sessionStorage.removeItem('south');
        sessionStorage.removeItem('east');
        sessionStorage.removeItem('west');
        setSelectedRegion(null);
    }, []);

    const updateCoordinate = useCallback((key, value) => {
        const setter = {
            north: setNorth,
            south: setSouth,
            east: setEast,
            west: setWest
        }[key];

        setter(value);
        sessionStorage.setItem(key, value);

        const newBounds = [
            [parseFloat(key === 'south' ? value : south), parseFloat(key === 'west' ? value : west)],
            [parseFloat(key === 'north' ? value : north), parseFloat(key === 'east' ? value : east)]
        ];
        setSelectedRegion(newBounds);
    }, [north, south, east, west]);

    const handleMapLayerChange = useCallback((value) => {
        setSelectedMapLayer(value);
    }, []);

    const handleDateChange = useCallback((newDate) => {
        setSelectedDate(newDate);
    }, []);

    const handleBaseDateChange = useCallback((newDate) => {
        setBaseDate(newDate);
        // Update session storage whenever base date changes
        sessionStorage.setItem('baseDate', newDate.toISOString().split('T')[0]);
    }, []);

    const handleDepthChange = useCallback((newDepth) => {
        setDepth(newDepth);
    }, []);

    const changeOverlay = useCallback((overlayType) => {
        setActiveOverlay(overlayType);
    }, []);

    const handleRegionSelect = useCallback(({ north, south, east, west }) => {
        if (north && south && east && west) {
            updateCoordinate('north', north);
            updateCoordinate('south', south);
            updateCoordinate('east', east);
            updateCoordinate('west', west);
        } else {
            setSelectedRegion(null);
        }
    }, [updateCoordinate]);

    const handleZoomToRegion = useCallback(({ north, south, east, west }) => {
        if (north && south && east && west && mapRef.current) {
            const bounds = [
                [parseFloat(south), parseFloat(west)],
                [parseFloat(north), parseFloat(east)]
            ];
            const map = mapRef.current;
            setIsZooming(true);
            map.flyToBounds(bounds, {
                padding: [50, 50],
                maxZoom: 4,
                duration: 1,
                easeLinearity: 0.8
            });
        }
    }, []);

    const handleToggleLeadDaysResults = useCallback((data) => {
        if (data) {
            setLeadDaysData(data);
            setShowLeadDaysResults(true);
        }
    }, []);

    const handleCloseLeadDaysResults = useCallback(() => {
        setShowLeadDaysResults(false);
    }, []);

    const renderRectangle = useCallback(() => {
        if (selectedRegion) {
            return (
                <Pane style={{ zIndex: 450 }}>
                    <RectangleWithCloseButton 
                        bounds={selectedRegion} 
                        onRemove={() => setSelectedRegion(null)}
                        clearCoordinates={clearCoordinates}
                    />
                </Pane>
            );
        }
        return null;
    }, [selectedRegion, clearCoordinates]);


    useEffect(() => {
        const storedNorth = sessionStorage.getItem('north');
        const storedSouth = sessionStorage.getItem('south');
        const storedEast = sessionStorage.getItem('east');
        const storedWest = sessionStorage.getItem('west');

        if (storedNorth && storedSouth && storedEast && storedWest) {
            const bounds = [
                [parseFloat(storedSouth), parseFloat(storedWest)],
                [parseFloat(storedNorth), parseFloat(storedEast)]
            ];
            setSelectedRegion(bounds);
            
            const centerLat = (parseFloat(storedNorth) + parseFloat(storedSouth)) / 2;
            const centerLon = (parseFloat(storedEast) + parseFloat(storedWest)) / 2;
            console.log('Calculated center:', [centerLat, centerLon]);
            setInitialCenter([centerLat, centerLon]);
            console.log('Center:', initialCenter);
            setInitialZoom(4);
        }
    }, []);


    useEffect(() => {
        console.log('Updated initialCenter:', initialCenter);
        
        // Now we can safely use the updated initialCenter
        if (mapRef.current && initialCenter[0] !== 25) {  // Check if it's not the default value
            const map = mapRef.current;
            map.setView(initialCenter, 4);
            
            // If you need to fit bounds as well
            const storedNorth = sessionStorage.getItem('north');
            const storedSouth = sessionStorage.getItem('south');
            const storedEast = sessionStorage.getItem('east');
            const storedWest = sessionStorage.getItem('west');
            
            if (storedNorth && storedSouth && storedEast && storedWest) {
                const bounds = [
                    [parseFloat(storedSouth), parseFloat(storedWest)],
                    [parseFloat(storedNorth), parseFloat(storedEast)]
                ];
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 4,
                    duration: 1,
                    easeLinearity: 0.8
                });
            }
        }
    }, [initialCenter]); 

    // Map layer configuration
    const mapLayers = {
        default: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service'
        },
        light: {
            url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
        dark: {
            url: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        }
    };

    const messageStyle = {
        position: 'fixed',
        top: '135px',
        left: '10px',
        backgroundColor: 'white',
        padding: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1000,
        width: '200px',
        textAlign: 'center'
    };





    // useEffect(() => {
    //     const checkCapabilities = async () => {
    //         const capabilities = await checkWMTSCapabilities();
    //         if (capabilities) {
    //             console.log('WMTS service is available');
    //         }
    //     };
        
    //     checkCapabilities();
    // }, []);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flexGrow: 1, position: 'relative' }}>
                <MapContainer 
                    center={initialCenter}
                    zoom={initialZoom}
                    style={{ height: "100vh", width: "100%" }}
                    minZoom={2.34}
                    maxBounds={[[80, -180], [-75, 180]]}
                    maxBoundsViscosity={1.0}
                    zoomControl={false}
                    ref={mapRef}
                >
                    <TileLayer
                        url={mapLayers[selectedMapLayer].url}
                        attribution={mapLayers[selectedMapLayer].attribution}
                    />
                    <Pane name="data-visualization" style={{ zIndex: 300 }}>
                    {/* <WMTSOverlay /> */}

                        <WMSOverlayLayers 
                            selectedDate={selectedDate}
                            baseDate={baseDate}
                            depth={depth}
                            activeOverlay={activeOverlay}
                        />
                    </Pane>
                    <Pane name="labels-and-outlines" style={{ zIndex: 400 }}>
                        <TileLayer
                            url='https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png'
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                    </Pane>
                    {renderRectangle()}
                    <TemperaturePopup 
                        baseDate={baseDate}
                        selectedDate={selectedDate}
                        activeOverlay={activeOverlay}
                        onToggleLeadDaysResults={handleToggleLeadDaysResults}
                        depth={depth}
                    />
                </MapContainer>

                {/* Map Controls */}
                <div style={{ position: 'absolute', top: '4rem', left: '10px', zIndex: 1000 }}>
                    <MapStyleSelector 
                        selectedMapLayer={selectedMapLayer}
                        handleMapLayerChange={handleMapLayerChange}
                    />
                </div>

                {/* Toggle Buttons */}
                <div style={{ position: 'absolute', top: '4rem', right: '10px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <ToggleButton 
                        active={activeOverlay === 'sst'}
                        setActive={() => changeOverlay('sst')}   
                        imageSrc="/images/sst12.png" 
                        name="Sea Surface Temperature"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'thetao'}
                        setActive={() => changeOverlay('thetao')}   
                        imageSrc="/images/pt12.png" 
                        name="Potential temperature"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'zos'}
                        setActive={() => changeOverlay('zos')}   
                        imageSrc="/images/ssh12.png" 
                        name="Sea Surface Height"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'speed'}
                        setActive={() => changeOverlay('speed')}   
                        imageSrc="/images/speed12.png" 
                        name="Current speed"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'so'}
                        setActive={() => changeOverlay('so')}   
                        imageSrc="/images/salinity12.png" 
                        name="Salinity"
                    />

                    <br/>
                    
                    <button
                        onClick={handleResetZoom}
                        className="bg-black bg-opacity-50 hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 focus:outline-none focus:shadow-outline flex items-center justify-center text-xs mx-2"
                    >
                        <Minimize size={15} className="mr-2" />
                        Reset Zoom
                    </button>
                    

                    <ToggleableRegionSelector
                        depth={depth}
                        activeOverlay={activeOverlay}
                        baseDate={baseDate}
                        selectedDate={selectedDate}
                        onRegionSelect={handleRegionSelect}
                        onZoomToRegion={handleZoomToRegion}
                        north={north}
                        south={south}
                        east={east}
                        west={west}
                        updateCoordinate={updateCoordinate}
                    />
                </div>

                {/* Slider and Legend */}
                <div className={`
                    fixed left-0 right-0 z-[1001]
                    transition-all duration-300 ease-in-out
                    ${showLeadDaysResults ? 'bottom-[calc(25vh+1rem)]' : 'bottom-1'}
                `}>
                    {console.log('Passing baseDate to SliderComponent:', baseDate)}
                    <SliderComponent 
                        onDateChange={handleDateChange}
                        onBaseDateChange={handleBaseDateChange}
                        onDepthChange={handleDepthChange}
                        activeOverlay={activeOverlay}
                        baseDate={baseDate}
                        selectedDate={selectedDate}
                        depth={depth}
                        isLeadDaysVisible={showLeadDaysResults}
                    />
                </div>

                <div className={`
                    fixed right-0 z-[1001]
                    transition-all duration-300 ease-in-out
                    ${showLeadDaysResults ? 'bottom-[calc(25vh+1rem)]' : 'bottom-1'}
                `}>
                    <div className="p-2">
                        <LegendComponent activeOverlay={activeOverlay} />
                    </div>
                </div>

                {/* Lead Days Results */}
                {showLeadDaysResults && (
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '15vh',
                        zIndex: 1000,
                    }}>
                        <LeadDaysResults 
                            results={leadDaysData} 
                            activeOverlay={activeOverlay} 
                            isVisible={showLeadDaysResults}
                            depth={depth}
                            onClose={handleCloseLeadDaysResults}
                            className="fixed bottom-0 left-0 right-0 z-[1000]"
                        />
                    </div>
                )}

{/* Status Messages */}
{dataStatus.loading && (
                    <div className='rounded-full font-semibold text-xs' style={messageStyle}>
                        Loading data...
                    </div>
                )}
                {!dataStatus.loading && dataStatus.dataAvailable && (
                    <div 
                        className='rounded-full font-semibold text-xs'
                        style={{...messageStyle, cursor: 'pointer'}}
                        onClick={() => console.log("Data is available")}
                    >
                        Data available. Tap anywhere.
                    </div>
                )}
            </div>
        </div>
    );
};

// Custom CSS animations and keyframes
const styles = `
    @keyframes slide-up {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .animate-slide-up {
        animation: slide-up 1s ease-out forwards;
    }
`;

// Add styles to document
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

export default React.memo(SSTMap);