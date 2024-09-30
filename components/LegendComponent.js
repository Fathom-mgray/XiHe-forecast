import React from 'react';
import { scaleLinear } from 'd3-scale';
import { interpolateYlGn, interpolatePlasma, interpolateRdBu, interpolateCool } from 'd3-scale-chromatic';

const VARIABLE_OPTS = {
    "so": { "interpolator": interpolateYlGn, "vmin": 20, "vmax": 35, "name": "Salinity", "unit": "PSU" },
    "thetao": { "interpolator": interpolatePlasma, "vmin": -4, "vmax": 30, "name": "Potential Temperature", "unit": "°C" },
    "sst": { "interpolator": interpolatePlasma, "vmin": -4, "vmax": 30, "name": "Surface Temperature", "unit": "°C" },
    "zos": { "interpolator": interpolateRdBu, "vmin": -2, "vmax": 2, "name": "Surface Height", "unit": "m" },
    "speed": { 
        "interpolator": t => interpolateCool(t * 0.5),  // Use only the first half of the cool scale
        "vmin": 0, 
        "vmax": 2, 
        "name": "Current Speed", 
        "unit": "m/s" 
    }
};

const LegendComponent = ({ activeOverlay }) => {
    const variable = VARIABLE_OPTS[activeOverlay] || VARIABLE_OPTS['sst'];
    const { interpolator, vmin, vmax, name, unit } = variable;

    const colorScale = scaleLinear()
        .domain([vmin, vmax])
        .range([0, 1])
        .clamp(true);

    const colorArray = Array.from({ length: 100 }, (_, i) => interpolator(i / 99));

    return (
        <div className="p-3 my-4 rounded" style={{ width: '22vw', maxWidth: '450px', minWidth: '150px', position: 'relative' }}>
            <div style={{ height: '20px', display: 'flex', position: 'relative', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.3)', borderRadius: '4px' }}>
                {colorArray.map((color, index) => (
                    <div key={index} style={{ background: color, flex: 1 }} />
                ))}
                <div style={{ position: 'absolute', left: '2px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'white', paddingLeft: '2px', zIndex: 1, textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}>
                    {vmin} {unit}
                </div>
                <div style={{ position: 'absolute', right: '2px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'white', paddingRight: '2px', zIndex: 1, textShadow: '1px 1px 3px rgba(0, 0, 0, 0.8)' }}>
                    {vmax} {unit}
                </div>
            </div>
        </div>
    );
};

export default LegendComponent;