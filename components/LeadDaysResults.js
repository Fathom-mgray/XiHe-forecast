import React, { useEffect, useMemo } from 'react';
import { ComposedChart, Scatter, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeadDaysResults = ({ results, activeOverlay, isVisible, depth, onClose }) => {
    useEffect(() => {
        console.log("LeadDaysResults rendered. isVisible:", isVisible, "results:", results);
    }, [isVisible, results]);

    const overlayConfig = {
        sst: { name: 'Sea Surface Temperature', unit: '°C', color: '#FF6B6B' },
        thetao: { name: 'Temperature', unit: '°C', color: '#4ECDC4' },
        so: { name: 'Salinity', unit: 'PSU', color: '#45B7D1' },
        zos: { name: 'Sea Surface Height', unit: 'm', color: '#FFA07A' },
        speed: { name: 'Current Speed', unit: 'm/s', color: '#98D8C8' },
    };

    const baseDate = new Date('2023-10-04'); // Sample base date, adjust as needed

    const chartData = useMemo(() => {
        return results?.map(result => {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + result.lead_day);
            return {
                date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                value: result.data_value
            };
        }) || [];
    }, [results]);

    const [minValue, maxValue] = useMemo(() => {
        if (chartData.length === 0) return [0, 1];
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1; // Add 10% padding
        return [min - padding, max + padding];
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #ccc' }}>
                    <p className="label">{`Date : ${payload[0].payload.date}`}</p>
                    <p className="intro">{`Value : ${payload[0].payload.value} ${overlayConfig[activeOverlay].unit}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div 
            className={`bg-white bg-opacity-100 rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} 
            style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '30vh', 
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div className="flex justify-between items-center p-2">
                <button 
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-1 overflow-hidden">
            <div className="w-4/5 pr-4">
    {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="90%">
            <ComposedChart margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    type="category"
                    label={{ 
                        value: 'Date', 
                        position: 'bottom', 
                        offset: -10,  // Increased negative offset to move label up
                        fontSize: '0.8rem',
                        dy: -10  // Added negative dy to move label up
                    }}
                    tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                    tickFormatter={(value) => value.slice(5)} // Display as MM-DD
                    height={60}
                />
                <YAxis 
                    domain={[minValue, maxValue]} 
                    label={{ value: overlayConfig[activeOverlay].unit, angle: -90, position: 'insideLeft', offset: 15, fontSize: 12 }}
                    tickFormatter={(value) => value.toFixed(2)}
                    tick={{ fontSize: 10 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                    type="monotone"
                    dataKey="value"
                    data={chartData}
                    stroke={overlayConfig[activeOverlay].color}
                    strokeWidth={2}
                    dot={true}
                />
            </ComposedChart>
        </ResponsiveContainer>
    ) : (
        <div className="h-full flex items-center justify-center text-sm">No data available</div>
    )}

    
</div>

                
                <div className="w-1/5 pl-4 border-l overflow-y-auto">
                    <h3 className="text-lg font-bold mb-2">About</h3>
                    <ul className="text-xs space-y-2">
                        <li>
                            <span className="font-medium">Overlay:</span> {overlayConfig[activeOverlay].name}
                        </li>
                        <li>
                            <span className="font-medium">Unit:</span> {overlayConfig[activeOverlay].unit}
                        </li>
                        <li>
                            <span className="font-medium">Depth:</span> {depth !== undefined ? `${depth}m` : 'N/A'}
                        </li>
                        <li>
                            <span className="font-medium">Data Points:</span> {chartData.length}
                        </li>
                        <li>
                            <span className="font-medium">Date Range:</span> {chartData.length > 0 ? `${chartData[0].date} to ${chartData[chartData.length - 1].date}` : 'N/A'}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LeadDaysResults;