'use client';
import { useEffect, useState } from 'react';
import Map, { Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { contourDensity } from 'd3-contour';
import * as d3 from 'd3';

const FetchDataComponent = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [contoursGeoJson, setContoursGeoJson] = useState(null);
  
    useEffect(() => {
      const apiUrl = `http://127.0.0.1:5000/get-json-data?file=XiHe_model_outputs/temp_outputs/20240904_lead01_sst_0m.json`;
  
      const fetchData = async () => {
        try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const result = await response.json();
          console.log(result);
  
          // Extract features from the nested data
          const rawData = result.data.features;
          if (!Array.isArray(rawData)) {
            throw new Error('Fetched data is not an array');
          }
          setData(rawData);
  
          // Convert raw data to contours
          const contoursData = rawData.map(d => {
            const [x, y] = JSON.parse(d.geometry.coordinates);
            return {
              x,
              y,
              value: parseFloat(d.properties.value)
            };
          }).filter(d => !isNaN(d.value)); // Filter out 'nan' values
  
          // Calculate the extent of the data
          const xExtent = d3.extent(contoursData, d => d.x);
          const yExtent = d3.extent(contoursData, d => d.y);
          const valueExtent = d3.extent(contoursData, d => d.value);
  
          // Create scales for x and y
          const xScale = d3.scaleLinear().domain(xExtent).range([0, 1]);
          const yScale = d3.scaleLinear().domain(yExtent).range([0, 1]);
  
          // Generate contours
          const contourGenerator = d3.contours()
            .size([100, 100])
            .thresholds(d3.range(valueExtent[0], valueExtent[1], (valueExtent[1] - valueExtent[0]) / 20));
  
          const contours = contourGenerator(contoursData.map(d => d.value));
  
          // Convert contours to GeoJSON format
          const contoursGeoJson = {
            type: 'FeatureCollection',
            features: contours.map(contour => ({
              type: 'Feature',
              properties: {
                value: contour.value
              },
              geometry: {
                type: 'MultiPolygon',
                coordinates: contour.coordinates.map(polygon =>
                  polygon.map(ring =>
                    ring.map(([x, y]) => [
                      xScale.invert(x / 100),
                      yScale.invert(y / 100)
                    ])
                  )
                )
              }
            }))
          };
  
          console.log(contoursGeoJson); // Verify GeoJSON structure
          setContoursGeoJson(contoursGeoJson);
  
        } catch (error) {
          setError(error);
          console.error('There was a problem with the fetch operation:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, []); // Empty dependency array means this effect runs once on mount

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <div style={{ width: '100%', height: '700px' }}>
        <Map
          initialViewState={{
            longitude: -100, // Set initial longitude
            latitude: 37.8,  // Set initial latitude
            zoom: 3          // Set initial zoom level
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11" // Choose map style
          mapboxAccessToken={'pk.eyJ1Ijoiamhhc2h1NCIsImEiOiJjbTBqbHRxeGgwemxpMmpxMGs0ZXVya3NlIn0.RqVlMiIX3e3Jsth6WjJiYw'} // Mapbox token
        >
          
          <Source id="contours" type="geojson" data={contoursGeoJson}>
  <Layer
    id="contour-layer"
    type="fill"
    paint={{
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'value'],
        -2, '#3288bd',  // coolest
        -1, '#66c2a5',
        0, '#abdda4',
        1, '#e6f598',
        2, '#fee08b',
        3, '#fdae61',
        4, '#f46d43',
        5, '#d53e4f'   // hottest
      ],
      'fill-opacity': 0.7
    }}
  />
  <Layer
    id="contour-lines"
    type="line"
    paint={{
      'line-color': '#000',
      'line-width': 1,
      'line-opacity': 0.5
    }}
  />
</Source>
        </Map>
      </div>
    </div>
  );
};

export default FetchDataComponent;


