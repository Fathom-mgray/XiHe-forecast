import React from 'react';
import { scaleLinear } from 'd3-scale';
import { interpolateYlGn, interpolatePlasma, interpolateRdBu, interpolateCool } from 'd3-scale-chromatic';

const VARIABLE_OPTS = {
    "so": { "interpolator": interpolateYlGn, "vmin": 20, "vmax": 35, "name": "Salinity", "unit": "PSU" },
    "thetao": { "interpolator": interpolatePlasma, "vmin": -4, "vmax": 30, "name": "Potential Temperature", "unit": "°C" },
    "sst": { "interpolator": interpolatePlasma, "vmin": -4, "vmax": 30, "name": "Surface Temperature", "unit": "°C" },
    "zos": { "interpolator": interpolateRdBu, "vmin": -2, "vmax": 2, "name": "Surface Height", "unit": "m" },
    "speed": { "interpolator": interpolateCool, "vmin": -2, "vmax": 2, "name": "Current Speed", "unit": "m/s" }
};

const LegendComponent = ({ activeOverlay }) => {
    // Check if activeOverlay exists in VARIABLE_OPTS, otherwise default to 'sst'
    const variable = VARIABLE_OPTS[activeOverlay] || VARIABLE_OPTS['sst'];
    const { interpolator, vmin, vmax, name, unit } = variable;

    // Create a color scale based on vmin and vmax
    const colorScale = scaleLinear()
        .domain([vmin, vmax]) // Mapping the range to vmin and vmax
        .range([0, 1])
        .clamp(true);

    // Create an array of colors from vmin to vmax
    const colorArray = Array.from({ length: 100 }, (_, i) => interpolator(i / 99));

    return (
        <div className="p-3 my-4 rounded" style={{ width: '350px', position: 'relative' }}>
            <div style={{ height: '20px', display: 'flex', position: 'relative', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
                {colorArray.map((color, index) => (
                    <div key={index} style={{ background: color, flex: 1 }} />
                ))}
                {/* Add vmin and vmax labels inside the color bar with text shadow */}
                <div style={{
                    position: 'absolute', 
                    left: '2px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '10px', 
                    color: 'white', 
                    paddingLeft: '2px',
                    zIndex: 1,
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'  // Add text shadow
                }}>
                    {vmin} {unit}
                </div>
                <div style={{
                    position: 'absolute', 
                    right: '2px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    fontSize: '10px', 
                    color: 'white', 
                    paddingRight: '2px',
                    zIndex: 1,
                    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)'  // Add text shadow
                }}>
                    {vmax} {unit}
                </div>
            </div>
        </div>
    );
};

export default LegendComponent;
