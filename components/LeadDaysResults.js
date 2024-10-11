import React, { useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LeadDaysResults = ({ results, activeOverlay, isVisible }) => {
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
            className={`bg-white p-4 rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} 
            style={{ 
                height: '30vh', 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                zIndex: 1000 
            }}
        >
            <h2 className="text-sm font-semibold mb-2">Lead Days Results</h2>
            {chartData.length > 0 ? (
                <div style={{ height: 'calc(100% - 40px)' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="leadDay" 
                                label={{ value: 'Lead Day', position: 'insideBottom', offset: -5 }}
                            />
                            <YAxis 
                                domain={[minValue, maxValue]} 
                                label={{ value: getUnitByOverlay(activeOverlay), angle: -90, position: 'insideLeft', offset: 15 }}
                                tickFormatter={(value) => value.toFixed(2)}
                            />
                            <Tooltip 
                                formatter={(value, name, props) => [value.toFixed(3), `Value (${getUnitByOverlay(activeOverlay)})`]}
                                labelFormatter={(value) => `Lead Day: ${value}`}
                            />
                            <Legend />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#8884d8" 
                                name={`Value (${getUnitByOverlay(activeOverlay)})`} 
                                dot={{ r: 4 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div>No data available</div>
            )}
        </div>
    );
};

export default LeadDaysResults;