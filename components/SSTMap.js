import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Pane, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import WMSOverlayLayers from './WMSOverlayLayers';
import ToggleButton from './ToggleButton';
import NavBar from './Navbar';
import SliderComponent from './SliderComponent';
import RegionSelector from './RegionSelector';
import LegendComponent from './LegendComponent';
import ToggleableRegionSelector from './ToggleableRegionSelector';
import './MapStyles.css';
import MapStyleSelector from './MapStyleSelector';
import InitialModal from './InitialModal';
import RectangleWithCloseButton from './RectangleWithCloseButton';
import TemperaturePopup from './TemperaturePopup';
import LeadDaysResults from './LeadDaysResults';
import AnimatedMapLayer from './AnimatedMapLayer';
// import ResetZoomControl from './ResetZoomControl';


const SSTMap = () => {
    const [shouldRenderRectangle, setShouldRenderRectangle] = useState(false);
    const [activeOverlay, setActiveOverlay] = useState('sst');
    const [showModal, setShowModal] = useState(true);
    const [showLeadDaysResults, setShowLeadDaysResults] = useState(false);
    const [leadDaysData, setLeadDaysData] = useState([]);
    const [clickedLocation, setClickedLocation] = useState(null);

    // Set the initial dates to yesterday
    const [north, setNorth] = useState(() => sessionStorage.getItem('north') || '');
    const [south, setSouth] = useState(() => sessionStorage.getItem('south') || '');
    const [east, setEast] = useState(() => sessionStorage.getItem('east') || '');
    const [west, setWest] = useState(() => sessionStorage.getItem('west') || '');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const [selectedDate, setSelectedDate] = useState(yesterday);
    const [baseDate, setBaseDate] = useState(yesterday);
    
    const [depth, setDepth] = useState(0);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [isZooming, setIsZooming] = useState(false);
    const [selectedMapLayer, setSelectedMapLayer] = useState('default');
    const [showInitialModal, setShowInitialModal] = useState(true);
    const [initialCenter, setInitialCenter] = useState([25, -90]);
    const [initialZoom, setInitialZoom] = useState(3);
    const [isInitialSetupDone, setIsInitialSetupDone] = useState(false);
    const [dataStatus, setDataStatus] = useState({ loading: false, dataAvailable: false });
    

    const mapRef = useRef(null);
    

    const handleDataStatusChange = useCallback((status) => {
        setDataStatus(status);
    }, []);

    const handleResetZoom = useCallback(() => {
        if (mapRef.current) {
            mapRef.current.setView([25, -90], 3);
        }
    }, [initialCenter, initialZoom]);

    const imageBounds = [
        [8.046585581289271, -98.95135746606363], // [lat_min, lon_min]
        [46.96790500433101, -59.94004524882491]  // [lat_max, lon_max]
      ];

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


    const handleInitialModalSubmit = useCallback(({ north, south, east, west, date }) => {
        console.log("Modal submitted with:", { north, south, east, west, date });
        const newSelectedDate = new Date(date);
        setSelectedDate(newSelectedDate);
        setBaseDate(newSelectedDate);

        if (north && south && east && west) {
            updateCoordinate('north', north);
            updateCoordinate('south', south);
            updateCoordinate('east', east);
            updateCoordinate('west', west);
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

        setIsInitialSetupDone(true);
        setShowInitialModal(false);
    }, [updateCoordinate]);

    const handleCloseInitialModal = useCallback(() => {
        console.log("Modal closed without submission");
        setIsInitialSetupDone(true);
        setShowInitialModal(false);
    }, []);

    useEffect(() => {
        console.log("showInitialModal:", showInitialModal);
        console.log("isInitialSetupDone:", isInitialSetupDone);
    }, [showInitialModal, isInitialSetupDone]);

    const handleMapLayerChange = useCallback((value) => {
        setSelectedMapLayer(value);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
    }, []);

    const handleDateChange = useCallback((newDate) => {
        setSelectedDate(newDate);
    }, []);

    const handleBaseDateChange = useCallback((newDate) => {
        setBaseDate(newDate);
    }, []);

    const handleDepthChange = useCallback((newDepth) => {
        setDepth(newDepth);
    }, []);

    const changeOverlay = useCallback((overlayType) => {
        setActiveOverlay(prevOverlay => {
            console.log('Changing overlay from', prevOverlay, 'to', overlayType);
            return overlayType;
        });
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

    // And update your handleToggleLeadDaysResults function:
    const handleToggleLeadDaysResults = useCallback((data) => {
        console.log("Toggling lead days results. Current state:", showLeadDaysResults, "New data:", data);
        if (data) {
            setLeadDaysData(data);
            setShowLeadDaysResults(true);
        } else {
            setShowLeadDaysResults(prev => prev);
        }
    }, [showLeadDaysResults]);

    const handleCloseLeadDaysResults = useCallback(() => {
        setShowLeadDaysResults(false);
    }, []);




    useEffect(() => {
        if (mapRef.current) {
            const map = mapRef.current;
            const handleMoveEnd = () => {
                console.log("Move ended, setting isZooming to false");
                setIsZooming(false);
            };
            map.on('moveend', handleMoveEnd);
            return () => map.off('moveend', handleMoveEnd);
        }
    }, []);

    useEffect(() => {
        console.log("Selected Region:", selectedRegion);
        console.log("Is Zooming:", isZooming);
    }, [selectedRegion, isZooming]);

    const renderRectangle = useCallback(() => {
        if (selectedRegion) {
            console.log("Rendering rectangle with bounds:", selectedRegion);
            
            const handleRemoveRectangle = () => {
                setSelectedRegion(null);
            };
        
            return (
                <Pane style={{ zIndex: 450 }}>
                    <RectangleWithCloseButton 
                        bounds={selectedRegion} 
                        onRemove={handleRemoveRectangle}
                        clearCoordinates={clearCoordinates}
                    />
                </Pane>
            );
        }
        return null;
    }, [selectedRegion, clearCoordinates]);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flexGrow: 1, position: 'relative' }}>
                {isInitialSetupDone && (
                    <MapContainer 
                        center={initialCenter}
                        zoom={initialZoom}
                        style={{ height: "100vh", width: "100%", zIndex: 1  }}
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
                        {/* <div className="App">
                        <AnimatedMapLayer bounds={imageBounds} opacity={1} interval={150} />
                        </div> */}
                        {renderRectangle()}
                        <TemperaturePopup 
                            baseDate={baseDate}
                            selectedDate={selectedDate}
                            activeOverlay={activeOverlay}
                            onToggleLeadDaysResults={handleToggleLeadDaysResults}
                            depth={depth}
                        />
                        

                    </MapContainer>
                )}
                <div style={{ 
                    position: 'absolute', 
                    top: '4rem', 
                    left: '10px', 
                    zIndex: 1000
                }}>
                    <MapStyleSelector 
                        selectedMapLayer={selectedMapLayer}
                        handleMapLayerChange={handleMapLayerChange}
                    />
                </div>
                <div style={{ 
                    position: 'absolute', 
                    top: '4rem', 
                    right: '10px', 
                    zIndex: 1000, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end'
                }}>
                    <ToggleButton 
                        active={activeOverlay === 'sst'}
                        setActive={() => changeOverlay('sst')}   
                        imageSrc="/images/fire.png" 
                        name="Sea Surface Temperature"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'thetao'}
                        setActive={() => changeOverlay('thetao')}   
                        imageSrc="/images/potential_temp.png" 
                        name="Potential temperature"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'zos'}
                        setActive={() => changeOverlay('zos')}   
                        imageSrc="/images/sea_surface.png" 
                        name="Sea Surface Height"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'speed'}
                        setActive={() => changeOverlay('speed')}   
                        imageSrc="/images/wind.png" 
                        name="Current speed"
                    />
                    <ToggleButton 
                        active={activeOverlay === 'so'}
                        setActive={() => changeOverlay('so')}   
                        imageSrc="/images/salt.png" 
                        name="Salinity"
                    />
                    {/* Add Reset Zoom button here */}
                    <button
                        onClick={handleResetZoom}
                        className="bg-black text-white bg-opacity-40 px-4 py-2 text-xs rounded-full shadow-md hover:bg-black  transition-colors duration-200 mt-4 mr-3"
                    >
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
        
        {/* <ResetZoomControl initialCenter={initialCenter} initialZoom={initialZoom} /> */}


                </div>
                
                
                <div className={`
    fixed left-0 right-0 z-[1001] // Increased z-index
    transition-all duration-300 ease-in-out
    ${showLeadDaysResults ? 'bottom-[calc(25vh+1rem)]' : 'bottom-1'}
`}>
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
    <div className="p-2 ">
        <LegendComponent activeOverlay={activeOverlay} />
    </div>
</div>
                
                {/* )} */}
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
                            className="fixed bottom-0 left-0 right-0 z-[1000]" // Ensure it's below the slider but above the map
                        />
                    </div>
                )}
               


                {dataStatus.loading && (
                    <div className='rounded-full font-semibold text-xs' style={messageStyle}>
                        Loading data...
                    </div>
                )}
                {!dataStatus.loading && dataStatus.dataAvailable && (
                    <div 
                        className='rounded-full font-semibold text-xs'
                        style={{...messageStyle, cursor: 'pointer'}}
                        onClick={() => console.log("Data is available. Implement view action here.")}
                    >
                        Data available. Tap anywhere.
                    </div>
                )}
                <InitialModal
                isOpen={showInitialModal}
                onClose={handleCloseInitialModal}
                onSubmit={handleInitialModalSubmit}
                initialNorth={north}
                initialSouth={south}
                initialEast={east}
                initialWest={west}
            />
            </div>
        </div>
    );
};

export default React.memo(SSTMap);