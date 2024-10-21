'use client';
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SSTMap = () => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [sstLayer, setSSTLayer] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const leafletMap = L.map(mapRef.current).setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(leafletMap);

    setMap(leafletMap);

    return () => {
      leafletMap.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    const fetchSSTData = async () => {
      const bounds = map.getBounds();
      const zoom = map.getZoom();
      console.log("Current map bounds:", bounds);
      console.log("Current zoom level:", zoom);

      const visibleTiles = getVisibleTiles(bounds, zoom);
      console.log("Calculated visible tiles:", visibleTiles);

      if (visibleTiles.length === 0) {
        console.log("No visible tiles to fetch");
        return;
      }

      try {
        console.log("Sending request to backend...");
        const response = await fetch('http://127.0.0.1:5000/sst/tiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            zoom,
            tiles: visibleTiles,
            date: '2024-10-05',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch SST data');
        }

        const data = await response.json();
        console.log("Received data from backend:", data);
        if (data.results && data.results.length > 0) {
          renderSSTData(data.results);
        } else {
          console.log("No SST data received for the visible tiles");
        }
        console.log('API Timing:', data.timing);
      } catch (error) {
        console.error('Error fetching SST data:', error);
      }
    };

    console.log("Setting up event listener for moveend");
    map.on('moveend', fetchSSTData);
    console.log("Calling initial fetchSSTData");
    fetchSSTData(); // Initial fetch

    return () => {
      console.log("Cleaning up event listener");
      map.off('moveend', fetchSSTData);
    };
  }, [map]);

  const getVisibleTiles = (bounds, zoom) => {
    console.log("Calculating visible tiles for bounds:", bounds, "and zoom:", zoom);
    const tileBounds = {
      min: latLngToTile(bounds.getSouthWest(), zoom),
      max: latLngToTile(bounds.getNorthEast(), zoom)
    };
    console.log("Calculated tile bounds:", tileBounds);
  
    const tiles = [];
    const minX = Math.min(tileBounds.min.x, tileBounds.max.x);
    const maxX = Math.max(tileBounds.min.x, tileBounds.max.x);
    const minY = Math.min(tileBounds.min.y, tileBounds.max.y);
    const maxY = Math.max(tileBounds.min.y, tileBounds.max.y);
  
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push([x, y]);
      }
    }
  
    console.log("Returning tiles:", tiles);
    return tiles;
  };
  
  // Update the latLngToTile function to handle negative coordinates
  const latLngToTile = (latLng, zoom) => {
    const x = Math.floor((latLng.lng + 180) / 360 * Math.pow(2, zoom));
    const y = Math.floor((1 - Math.log(Math.tan((latLng.lat * Math.PI) / 180) + 1 / Math.cos((latLng.lat * Math.PI) / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
    console.log("Converting latLng:", latLng, "to tile coordinates:", {x, y}, "at zoom level:", zoom);
    return { x: x < 0 ? 0 : x, y: y < 0 ? 0 : y };
  };
  const renderSSTData = (sstData) => {
    console.log("Rendering SST data:", sstData);
    if (sstLayer) {
      map.removeLayer(sstLayer);
    }

    const canvasLayer = L.canvas().addTo(map);
    setSSTLayer(canvasLayer);

    sstData.forEach(tile => {
      const { x, y, width, height, data, min_val, max_val } = tile;
      const tileSize = 256;
      const pixelSize = tileSize / width;

      const colorScale = (value) => {
        const normalized = (value - min_val) / (max_val - min_val);
        return `hsl(${240 - normalized * 240}, 100%, 50%)`;
      };

      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const value = data[i][j];
          canvasLayer._ctx.fillStyle = colorScale(value);
          const pixelX = x * tileSize + j * pixelSize;
          const pixelY = y * tileSize + i * pixelSize;
          canvasLayer._ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
        }
      }
    });
    console.log("Finished rendering SST data");
  };

  return <div ref={mapRef} style={{ width: '100%', height: '500px' }} />;
};

export default SSTMap;