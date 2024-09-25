import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

const OceanCurrentLayer = ({ map }) => {
  const layerRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!map) return;

    const fetchData = async () => {
      const url = `http://localhost:5000/ocean_currents`;
      try {
        const response = await fetch(url);
        const jsonData = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching ocean current data:", error);
      }
    };

    fetchData();
    map.on("moveend", fetchData);

    return () => {
      map.off("moveend", fetchData);
    };
  }, [map]);

  useEffect(() => {
    if (!map || data.length === 0) return;

    const OceanCurrentLayer = L.Layer.extend({
      onAdd: function (map) {
        this._map = map;
        this._initCanvas();
        this._initParticles();
        this._frame = null;
        this._animate();
        map.on("moveend", this._reset, this);
      },

      onRemove: function (map) {
        L.DomUtil.remove(this._canvas);
        map.off("moveend", this._reset, this);
        cancelAnimationFrame(this._frame);
      },

      _initCanvas: function () {
        this._canvas = L.DomUtil.create("canvas", "leaflet-layer");
        this._canvas.width = this._map.getSize().x;
        this._canvas.height = this._map.getSize().y;
        this._ctx = this._canvas.getContext("2d");
        this._map.getPanes().overlayPane.appendChild(this._canvas);
      },

      _reset: function () {
        const topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this._initParticles();
      },

      _initParticles: function () {
        this.maxSpeed = Math.max(...data.map((point) => Math.sqrt(point.uo * point.uo + point.vo * point.vo)));

        this._particles = [];
        data.forEach((point) => {
          const speed = Math.sqrt(point.uo * point.uo + point.vo * point.vo);
          const particleCount = Math.ceil((speed / this.maxSpeed) * 20); // Increase particle count based on speed
          for (let i = 0; i < particleCount; i++) {
            this._particles.push({
              x: point.lon + (Math.random() - 0.5) * 0.01, // Start positions with slight randomness
              y: point.lat + (Math.random() - 0.5) * 0.01,
              u: point.uo,
              v: point.vo,
              speed: speed,
              age: 0, // Initialize age
              color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`, // Initial random transparency
              path: [],
              phase: Math.random() * Math.PI * 2, // For creating a curvy effect
            });
          }
        });
      },

      _animate: function () {
        this._frame = requestAnimationFrame(this._animate.bind(this));

        // Clear the canvas
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        this._particles.forEach((particle) => {
          const start = this._map.latLngToContainerPoint([particle.y, particle.x]);

          // Calculate the movement factor based on speed and wind pattern
          const moveFactor = 0.1 * particle.speed; // Adjust the multiplier for speed control

          // Curvy motion with added randomness
          particle.phase += 0.05; // Control the wave effect
          const randomness = Math.sin(particle.phase) * 0.1; // Adding wave-like movement
          particle.x += (particle.u + randomness) * moveFactor;
          particle.y += (particle.v + randomness) * moveFactor;

          particle.age += 0.01; // Increment age
          particle.path.push([start.x, start.y]); // Store the path for drawing later

          // Reset particle when it ages out
          if (particle.age > 1) {
            particle.age = 0;
            const newPoint = data[Math.floor(Math.random() * data.length)];
            particle.x = newPoint.lon + (Math.random() - 0.5) * 0.01;
            particle.y = newPoint.lat + (Math.random() - 0.5) * 0.01;
            particle.u = newPoint.uo;
            particle.v = newPoint.vo;
            particle.speed = Math.sqrt(newPoint.uo * newPoint.uo + newPoint.vo * newPoint.vo);
            particle.path = []; // Reset path when the particle is repositioned
            particle.phase = Math.random() * Math.PI * 2; // Reset phase for new particle
          }

          const end = this._map.latLngToContainerPoint([particle.y, particle.x]);

          // Draw particles along their path
          this._ctx.beginPath();
          particle.path.forEach((point) => {
            this._ctx.lineTo(point[0], point[1]);
          });

          this._ctx.strokeStyle = particle.color;
          this._ctx.lineWidth = 5 * (particle.speed / this.maxSpeed); // Adjust width based on speed
          this._ctx.globalAlpha = 1 - particle.age; // Fade out as particles age
          this._ctx.stroke();
        });
      }
    });

    const oceanCurrentLayer = new OceanCurrentLayer();
    map.addLayer(oceanCurrentLayer);
    layerRef.current = oceanCurrentLayer;

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
      }
    };
  }, [map, data]);

  return null;
};

export default OceanCurrentLayer;
