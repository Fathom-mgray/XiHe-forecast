import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { XYPlot, HeatmapSeries, LegendOrdinal, GradientDefs } from 'react-vis';
import { scaleLinear } from 'd3-scale';
import { interpolateViridis } from 'd3-scale-chromatic';

// This component will update the heatmap when the map moves
function HeatmapOverlay({ data }) {
  const map = useMap();
  const [mapState, setMapState] = useState({ center: map.getCenter(), zoom: map.getZoom() });

  useEffect(() => {
    function handleMoveEnd() {
      setMapState({ center: map.getCenter(), zoom: map.getZoom() });
    }
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map]);

  // Convert lat/lon to pixel coordinates
  const transformedData = data.map(point => {
    const pixelPoint = map.latLngToLayerPoint([point.lat, point.lon]);
    return { ...point, x: pixelPoint.x, y: pixelPoint.y };
  });

  const bounds = map.getBounds();
  const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());

  return (
    <div style={{ position: 'absolute', left: 0, top: 0, zIndex: 500 }}>
      <XYPlot
        width={map.getSize().x}
        height={map.getSize().y}
        style={{ position: 'absolute', left: -topLeft.x, top: -topLeft.y }}
      >
        <GradientDefs>
          <linearGradient id="heatmapGradient" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#3366cc" />
            <stop offset="50%" stopColor="#ffcc00" />
            <stop offset="100%" stopColor="#dc3912" />
          </linearGradient>
        </GradientDefs>
        <HeatmapSeries
          data={transformedData}
          colorRange={['#3366cc', '#ffcc00', '#dc3912']}
        />
      </XYPlot>
    </div>
  );
}

const D3Heatmap = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:5000/sst_geojson');
        const jsonData = await response.json();

        const processedData = jsonData.features.map(feature => ({
          lon: feature.geometry.coordinates[0],
          lat: feature.geometry.coordinates[1],
          value: feature.properties.value
        }));

        setData(processedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer center={[0, 0]} zoom={3} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <HeatmapOverlay data={data} />
      </MapContainer>
    </div>
  );
};

export default D3Heatmap;