'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import worldTopology from 'world-atlas/countries-110m.json';

const OceanCurrentsVisualization = () => {
  const canvasRef = useRef(null);
  const [currentData, setCurrentData] = useState([]);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ocean-currents');
      const data = await response.json();
      setCurrentData(data.data);
      setDebug(prev => prev + `Fetched ${data.data.length} data points\n`);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDebug(prev => prev + `Error fetching data: ${error}\n`);
    }
  };

  useEffect(() => {
    if (currentData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    setDebug(prev => prev + `Canvas size: ${width}x${height}\n`);

    const projection = d3.geoMercator().fitSize([width, height], { type: "Sphere" });
    const path = d3.geoPath().projection(projection).context(ctx);

    const world = feature(worldTopology, worldTopology.objects.countries);

    // Create particles
    const particles = currentData.map(d => ({
      x: projection([d.longitude, d.latitude])[0],
      y: projection([d.longitude, d.latitude])[1],
      u: d.u,
      v: d.v,
      speed: Math.sqrt(d.u * d.u + d.v * d.v)
    }));

    const maxSpeed = d3.max(particles, d => d.speed);
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, maxSpeed]);

    function drawMap() {
      ctx.clearRect(0, 0, width, height);
      
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = "#e6f3ff";
      ctx.fill();

      ctx.beginPath();
      path(world);
      ctx.fillStyle = "#d4d4d4";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    function drawParticles() {
      particles.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        
        // Update particle position
        p.x += p.u * 0.5;
        p.y += p.v * 0.5;

        // Wrap around edges
        p.x = (p.x + width) % width;
        p.y = (p.y + height) % height;

        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = colorScale(p.speed);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    function animate() {
      drawMap();
      drawParticles();
      requestAnimationFrame(animate);
    }

    animate();
    setDebug(prev => prev + "Animation started\n");

  }, [currentData]);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <canvas ref={canvasRef} width={1600} height={900} style={{ width: '100%', height: '100%' }} />
      <pre style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.7)' }}>
        {debug}
      </pre>
    </div>
  );
};

export default OceanCurrentsVisualization;