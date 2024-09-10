import React, { useState, useEffect } from 'react';
import { GeoJSON } from 'react-leaflet';

const CountryBoundariesLayer = () => {
    const [boundaries, setBoundaries] = useState(null);

    useEffect(() => {
        const fetchBoundaries = async () => {
            try {
                const response = await fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson');
                if (!response.ok) {
                    throw new Error('Failed to fetch country boundaries');
                }
                const data = await response.json();
                setBoundaries(data);
            } catch (error) {
                console.error('Error fetching country boundaries:', error);
            }
        };

        fetchBoundaries();
    }, []);

    if (!boundaries) {
        return null;
    }

    return (
        <GeoJSON
            data={boundaries}
            style={{
                fillColor: 'transparent',
                weight: 1,
                opacity: 0.5,
                color: 'lightgray',  // Changed from 'white' to 'black'
            }}
        />
    );
};

export default CountryBoundariesLayer;