import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Pane } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import SSTOverlayLayers from './SSTOverlayLayers';
import ToggleButton from './ToggleButton'
import NavBar from './Navbar'
import './MapStyles.css';
import SliderComponent from './SliderComponent';

const SSTMap = () => {
    const [isSSTOverlayVisible, setIsSSTOverlayVisible] = useState(true);
    const [isSalinityOverlayVisible, setIsSalinityOverlayVisible] = useState(false);
    const [isThetaOOverlayVisible, setIsThetaOOverlayVisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
    };

    

    useEffect(() => {
        console.log('Selected date updated:', selectedDate);
    }, [selectedDate]);

    return (
        <div style={{ position: 'relative', height: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <NavBar />
            <div style={{ flexGrow: 1, position: 'relative' }}>
                <MapContainer 
                    center={[25, -90]}
                    zoom={3}
                    style={{ height: "100vh", width: "100%" }}
                    minZoom={3}
                    maxBounds={[[80, -180], [-75, 180]]}
                    maxBoundsViscosity={1.0}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        noWrap={true}
                    />
                    <Pane name="data-visualization" style={{ zIndex: 200 }}>
                        {isSSTOverlayVisible && <SSTOverlayLayers selectedDate={selectedDate} />}
                    </Pane>
                    <Pane name="labels-and-outlines" style={{ zIndex: 400 }}>
                        <TileLayer
                            url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}{r}.png"
                            attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            subdomains='abcd'
                        />
                    </Pane>
                </MapContainer>
                <div style={{ 
                    position: 'absolute', 
                    top: '5rem', 
                    right: '10px', 
                    zIndex: 1000, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end'
                }}>
                    <ToggleButton 
                        visible={isSSTOverlayVisible} 
                        setVisible={setIsSSTOverlayVisible}   
                        imageSrc="/images/fire.png" 
                        name="Sea Surface Temperature"
                    />
                    <ToggleButton 
                        visible={isSalinityOverlayVisible} 
                        setVisible={setIsSalinityOverlayVisible}   
                        imageSrc="/images/salt.png" 
                        name="Salinity level"
                    />
                    <ToggleButton 
                        visible={isThetaOOverlayVisible} 
                        setVisible={setIsThetaOOverlayVisible}   
                        imageSrc="/images/fire.png" 
                        name="Theta O"
                    />
                </div>
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                }}>

                <SliderComponent 
                    isSalinityOverlayVisible={isSalinityOverlayVisible} 
                    onDateChange={handleDateChange}
                />
                </div>
            </div>
        </div>
    );
};

export default SSTMap;