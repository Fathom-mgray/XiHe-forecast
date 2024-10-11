import React, { useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeadDaysResults = ({ results, activeOverlay, isVisible, depth, onClose }) => {
    useEffect(() => {
        console.log("LeadDaysResults rendered. isVisible:", isVisible, "results:", results);
    }, [isVisible, results]);

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

    const getOverlayName = (overlay) => {
        switch (overlay) {
            case 'sst':
                return 'Sea Surface Temperature';
            case 'thetao':
                return 'Temperature';
            case 'so':
                return 'Salinity';
            case 'zos':
                return 'Sea Surface Height';
            case 'speed':
                return 'Current Speed';
            default:
                return overlay;
        }
    };

    const chartData = useMemo(() => {
        return results?.map(result => ({
            leadDay: result.lead_day,
            value: result.data_value
        })) || [];
    }, [results]);

    const [minValue, maxValue] = useMemo(() => {
        if (chartData.length === 0) return [0, 1];
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1; // Add 10% padding
        return [min - padding, max + padding];
    }, [chartData]);

    return (
        <div 
            className={`bg-white bg-opacity-90 rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} 
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
                {/* <h2 className="text-sm font-semibold">Lead Days Results</h2> */}
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
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="leadDay" 
                                    label={{ value: 'Lead Day', position: 'insideBottom', offset: -5, fontSize: 12 }}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis 
                                    domain={[minValue, maxValue]} 
                                    label={{ value: getUnitByOverlay(activeOverlay), angle: -90, position: 'insideLeft', offset: 15, fontSize: 12 }}
                                    tickFormatter={(value) => value.toFixed(2)}
                                    tick={{ fontSize: 10 }}
                                />
                                <Tooltip 
                                    formatter={(value, name, props) => [value.toFixed(3), `Value (${getUnitByOverlay(activeOverlay)})`]}
                                    labelFormatter={(value) => `Lead Day: ${value}`}
                                    contentStyle={{ fontSize: 12 }}
                                />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Line 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#8884d8" 
                                    name={`Value (${getUnitByOverlay(activeOverlay)})`} 
                                    dot={{ r: 3 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm">No data available</div>
                    )}
                </div>
                <div className="w-1/5 pl-4 border-l overflow-y-auto">
                    <h3 className="text-lg font-bold mb-2">About</h3>
                    <ul className="text-xs space-y-2">
                        <li>
                            <span className="font-medium">Overlay:</span> {getOverlayName(activeOverlay)}
                        </li>
                        <li>
                            <span className="font-medium">Unit:</span> {getUnitByOverlay(activeOverlay)}
                        </li>
                        <li>
                            <span className="font-medium">Depth:</span> {depth !== undefined ? `${depth}m` : 'N/A'}
                        </li>
                        <li>
                            <span className="font-medium">Data Points:</span> {chartData.length}
                        </li>
                        <li>
                            <span className="font-medium">Range:</span> {chartData.length > 0 ? `${chartData[0].leadDay} to ${chartData[chartData.length - 1].leadDay} days` : 'N/A'}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LeadDaysResults;