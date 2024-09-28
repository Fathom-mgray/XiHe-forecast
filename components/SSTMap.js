import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Pane, Rectangle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import WMSOverlayLayers from './WMSOverlayLayers';
import TemperatureDataHandler from './TemperatureDataHandler';
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


// Wrapper component to get access to the map instance


const SSTMap = () => {
    const [shouldRenderRectangle, setShouldRenderRectangle] = useState(false);
    const [activeOverlay, setActiveOverlay] = useState('sst');
    const [showModal, setShowModal] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [baseDate, setBaseDate] = useState(new Date());
    const [depth, setDepth] = useState(0);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [isZooming, setIsZooming] = useState(false);
    const [selectedMapLayer, setSelectedMapLayer] = useState('default');
    const [showInitialModal, setShowInitialModal] = useState(true);
    const [initialCenter, setInitialCenter] = useState([25, -90]);
    const [initialZoom, setInitialZoom] = useState(3);
    const [isInitialSetupDone, setIsInitialSetupDone] = useState(false);


    // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const mapRef = useRef(null);




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

    const handleInitialModalSubmit = useCallback(({ north, south, east, west, date }) => {
        console.log("Modal submitted with:", { north, south, east, west, date });
        const newSelectedDate = new Date(date);
        setSelectedDate(newSelectedDate);
        setBaseDate(newSelectedDate);
        console.log("Modal submitted with date:", baseDate, selectedDate);

        if (north && south && east && west) {
            const bounds = [
                [parseFloat(south), parseFloat(west)],
                [parseFloat(north), parseFloat(east)]
            ];
            setSelectedRegion(bounds);
            const centerLat = (parseFloat(north) + parseFloat(south)) / 2;
            const centerLon = (parseFloat(east) + parseFloat(west)) / 2;
            setInitialCenter([centerLat, centerLon]);
            setInitialZoom(4); // You can adjust this value as needed
        }

        setIsInitialSetupDone(true);
        setShowInitialModal(false);
    }, []);

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

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };


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
            const bounds = [
                [parseFloat(south), parseFloat(west)],
                [parseFloat(north), parseFloat(east)]
            ];
            console.log("Setting selected region:", bounds);
            setSelectedRegion(bounds);
        } else {
            setSelectedRegion(null);
        }
    }, []);

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

    
      
      // The renderRectangle function remains the same as in the previous example
      const renderRectangle = useCallback(() => {
        if (selectedRegion) {
          console.log("Rendering rectangle with bounds:", selectedRegion);
          
          const handleRemoveRectangle = () => {
            setSelectedRegion(null);
          };
      
          return (
            <Pane style={{ zIndex: 1000 }}>
            <RectangleWithCloseButton 
              bounds={selectedRegion} 
              onRemove={handleRemoveRectangle} 
            />
            </Pane>
          );
        }
        return null;
      }, [selectedRegion]);
    
    


    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flexGrow: 1, position: 'relative' }}>
            {isInitialSetupDone && (
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
                        // subdomains={mapLayers[selectedMapLayer].subdomains}
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
                    <Pane name="temperature-data" style={{ zIndex: 500 }}>
                        <TemperatureDataHandler 
                        selectedDate={selectedDate}
                        baseDate={baseDate}
                        depth={depth}
                        activeOverlay={activeOverlay}
                        />
                    </Pane>
                
                    {renderRectangle()}
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
                    <ToggleableRegionSelector onRegionSelect={handleRegionSelect} 
                    onZoomToRegion={handleZoomToRegion} />
                </div>
                
                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    left: '20px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                }}>
                    <SliderComponent 
                        onDateChange={handleDateChange}
                        onBaseDateChange={handleBaseDateChange}
                        onDepthChange={handleDepthChange}
                        activeOverlay={activeOverlay}
                        baseDate={baseDate}
                        selectedDate={selectedDate}

                    />
                </div>

                <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '2px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}>
                    
                    <div style={{ marginTop: '10px' }}>
                        <LegendComponent activeOverlay={activeOverlay} />
                    </div>
                </div>
                <InitialModal
                    isOpen={showInitialModal}
                    onClose={handleCloseInitialModal}
                    onSubmit={handleInitialModalSubmit}
                />
            </div>
        </div>
    );
};

export default React.memo(SSTMap);