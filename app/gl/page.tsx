'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import worldTopology from 'world-atlas/countries-110m.json';

const WorldMapWithAnimatedCurrents = () => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const { width, height } = svg.node().getBoundingClientRect();

    // Clear any existing content
    svg.selectAll("*").remove();

    // Create a projection
    const projection = d3.geoMercator()
      .fitSize([width, height], { type: "Sphere" });

    // Create a path generator
    const path = d3.geoPath().projection(projection);

    // Convert TopoJSON to GeoJSON
    const world = feature(worldTopology, worldTopology.objects.countries);

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(world.features)
      .enter().append("path")
      .attr("d", path)
      .attr("fill", "#ccc")
      .attr("stroke", "#fff");

    // Add a sphere
    svg.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "#000");

    // Generate some random ocean current data
    const currentData = d3.range(1000).map(() => ({
      longitude: Math.random() * 360 - 180,
      latitude: Math.random() * 180 - 90,
      u: (Math.random() * 2 - 1) * 0.1,  // Scaled down for smoother animation
      v: (Math.random() * 2 - 1) * 0.1   // Scaled down for smoother animation
    }));

    // Function to update particle positions
    function updateParticles() {
      svg.selectAll("circle")
        .attr("cx", d => {
          const [x, y] = projection([d.longitude, d.latitude]);
          d.longitude += d.u;
          if (d.longitude > 180) d.longitude -= 360;
          if (d.longitude < -180) d.longitude += 360;
          return x;
        })
        .attr("cy", d => {
          const [x, y] = projection([d.longitude, d.latitude]);
          d.latitude += d.v;
          d.latitude = Math.max(-90, Math.min(90, d.latitude));
          return y;
        });
    }

    // Draw ocean currents
    svg.selectAll("circle")
      .data(currentData)
      .enter()
      .append("circle")
      .attr("cx", d => projection([d.longitude, d.latitude])[0])
      .attr("cy", d => projection([d.longitude, d.latitude])[1])
      .attr("r", 2)
      .attr("fill", "blue")
      .attr("opacity", 0.5);

    // Animation loop
    function animate() {
      updateParticles();
      requestAnimationFrame(animate);
    }

    animate();

  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default WorldMapWithAnimatedCurrents;