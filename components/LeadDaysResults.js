import React, { useEffect, useMemo, useState } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LeadDaysResults = ({ results, depthProfile, activeOverlay, isVisible, depth, onClose }) => {
    const [activeTab, setActiveTab] = useState('leadDays');
    const hasDepthData = depthProfile && ['so', 'speed', 'thetao'].includes(activeOverlay);

    useEffect(() => {
        console.log("LeadDaysResults rendered. isVisible:", isVisible, "results:", results);
        if (hasDepthData) {
            console.log("Depth profile data received:", {
                overlay: activeOverlay,
                currentDepth: depth,
                profile: depthProfile
            });
        }
    }, [isVisible, results, depthProfile, activeOverlay, depth, hasDepthData]);

    const overlayConfig = {
        sst: { name: 'Sea Surface Temperature', unit: '°C', color: '#FF6B6B' },
        thetao: { name: 'Temperature', unit: '°C', color: '#4ECDC4' },
        so: { name: 'Salinity', unit: 'PSU', color: '#45B7D1' },
        zos: { name: 'Sea Surface Height', unit: 'm', color: '#FFA07A' },
        speed: { name: 'Current Speed', unit: 'm/s', color: '#98D8C8' },
    };

    const chartData = useMemo(() => {
        if (!results) return [];
        
        const dataPoints = Object.entries(results)
            .map(([key, value]) => ({
                lead_day: parseInt(key.replace('lead_day_', '')),
                value: value
            }))
            .sort((a, b) => a.lead_day - b.lead_day);

        const baseDate = new Date();
        return dataPoints.map(point => {
            const date = new Date(baseDate);
            date.setDate(date.getDate() + point.lead_day);
            return {
                date: date.toISOString().split('T')[0],
                value: point.value,
                lead_day: point.lead_day
            };
        });
    }, [results]);

    const [minValue, maxValue] = useMemo(() => {
        if (chartData.length === 0) return [0, 1];
        const values = chartData.map(d => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const padding = (max - min) * 0.1;
        return [min - padding, max + padding];
    }, [chartData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip bg-white p-2 border border-gray-200 rounded shadow">
                    <p className="label">{`Date: ${payload[0].payload.date}`}</p>
                    <p className="intro">{`Lead Day: ${payload[0].payload.lead_day}`}</p>
                    <p className="intro">{`Value: ${payload[0].payload.value.toFixed(2)} ${overlayConfig[activeOverlay].unit}`}</p>
                </div>
            );
        }
        return null;
    };

    const renderLeadDaysChart = () => (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart margin={{ top: 5, right: 30, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date" 
                    type="category"
                    label={{ 
                        value: 'Date', 
                        position: 'bottom', 
                        offset: -10,
                        fontSize: '0.8rem',
                        dy: -10
                    }}
                    tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }}
                    tickFormatter={(value) => value.slice(5)}
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
    );

    const renderDepthChart = () => {
        if (!depthProfile) return null;
    
        const depthData = depthProfile.y.map((d, i) => ({
            depth: d,
            value: depthProfile.x[i]
        })).sort((a, b) => a.depth - b.depth);
    
        return (
            <ResponsiveContainer width="100%" height="90%">
                <ComposedChart
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 0, bottom: 10 }}  // Adjusted margins to match lead days chart
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        label={{ 
                            value: overlayConfig[activeOverlay].unit,
                            position: 'top',
                            offset: -20,  // Adjusted offset
                            fontSize: '0.8rem' 
                        }}
                        orientation="top"
                        tickFormatter={(value) => value.toFixed(2)}
                        tick={{ fontSize: 10 }} 
                    />
                    <YAxis 
                        dataKey="depth"
                        type="number"
                        domain={[0, 'dataMax']}
                        label={{ 
                            value: 'Depth (m)', 
                            angle: -90, 
                            position: 'insideLeft', 
                            offset: 15,  
                            fontSize: 12  
                        }}
                        tick={{ fontSize: 10 }}  
                    />
                    <Tooltip 
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-2 border rounded shadow">
                                        <p>Depth: {payload[0].payload.depth}m</p>
                                        <p>Value: {payload[0].payload.value.toFixed(2)} {overlayConfig[activeOverlay].unit}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        data={depthData}
                        stroke={overlayConfig[activeOverlay].color}
                        strokeWidth={2} 
                        dot={{ fill: overlayConfig[activeOverlay].color }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        );
    };
    return (
        <div 
            className={`bg-white bg-opacity-100 rounded-t-lg shadow-lg transition-all duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} 
            style={{ 
                position: 'fixed', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                height: '35vh', 
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div className="flex justify-between items-center p-2">
                {hasDepthData && (
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setActiveTab('leadDays')}
                            className={`px-4 py-1 rounded-t-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'leadDays' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Lead Days
                        </button>
                        <button 
                            onClick={() => setActiveTab('depth')}
                            className={`px-4 py-1 rounded-t-lg text-sm font-medium transition-colors duration-200 ${
                                activeTab === 'depth' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Depth Profile
                        </button>
                    </div>
                )}
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
                    {activeTab === 'leadDays' ? (
                        chartData.length > 0 ? renderLeadDaysChart() : (
                            <div className="h-full flex items-center justify-center text-sm">No data available</div>
                        )
                    ) : (
                        hasDepthData ? renderDepthChart() : (
                            <div className="h-full flex items-center justify-center text-sm">No depth data available</div>
                        )
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
                        {activeTab === 'leadDays' ? (
                            <>
                                <li>
                                    <span className="font-medium">Data Points:</span> {chartData.length}
                                </li>
                                <li>
                                    <span className="font-medium">Lead Days:</span> {chartData.length > 0 ? `0 to ${chartData[chartData.length - 1].lead_day}` : 'N/A'}
                                </li>
                                <li>
                                    <span className="font-medium">Date Range:</span> {chartData.length > 0 ? `${chartData[0].date} to ${chartData[chartData.length - 1].date}` : 'N/A'}
                                </li>
                            </>
                        ) : (
                            hasDepthData && (
                                <>
                                    <li>
                                        <span className="font-medium">Current Depth:</span> {depth}m
                                    </li>
                                    <li>
                                        <span className="font-medium">Available Depths:</span> {depthProfile?.y.join(', ')}m
                                    </li>
                                </>
                            )
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LeadDaysResults;
