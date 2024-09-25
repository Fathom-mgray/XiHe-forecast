// 'use client';

// import React, { useEffect } from 'react';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import 'leaflet-contour/dist/leaflet-contour.css';
// import 'leaflet-contour';
// import * as turf from '@turf/turf';

// const generateRandomRasterData = (width, height) => {
//   const data = new Float32Array(width * height);
//   for (let i = 0; i < data.length; i++) {
//     data[i] = Math.random() * 100; // Generate random elevation data
//   }
//   return data;
// };

// const generateGeoJSON = (width, height, data) => {
//   const features = [];
//   const cellSize = 1;
//   for (let y = 0; y < height - 1; y++) {
//     for (let x = 0; x < width - 1; x++) {
//       const contour = turf.contour({
//         type: 'FeatureCollection',
//         features: [
//           {
//             type: 'Feature',
//             geometry: {
//               type: 'Polygon',
//               coordinates: [
//                 [
//                   [x * cellSize, y * cellSize],
//                   [(x + 1) * cellSize, y * cellSize],
//                   [(x + 1) * cellSize, (y + 1) * cellSize],
//                   [x * cellSize, (y + 1) * cellSize],
//                   [x * cellSize, y * cellSize],
//                 ],
//               ],
//             },
//             properties: {
//               elevation: data[y * width + x],
//             },
//           },
//         ],
//       });
//       features.push(...contour.features);
//     }
//   }
//   return {
//     type: 'FeatureCollection',
//     features,
//   };
// };

// const ContourMap = () => {
//   useEffect(() => {
//     const map = L.map('map').setView([51.505, -0.09], 13);

//     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//       attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     }).addTo(map);

//     // Generate random raster data
//     const width = 50;
//     const height = 50;
//     const rasterData = generateRandomRasterData(width, height);
//     const geoJSONData = generateGeoJSON(width, height, rasterData);

//     // Add contour lines
//     L.contour({
//       url: geoJSONData,
//       contourLevels: [10, 20, 30, 40, 50],
//       style: {
//         color: '#ff7800',
//         weight: 2,
//       },
//     }).addTo(map);

//   }, []);

//   return <div id="map" style={{ height: '500px' }}></div>;
// };

// export default ContourMap;
