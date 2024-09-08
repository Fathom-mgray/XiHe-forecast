"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// import SSTMap from "../components/SSTMap";
// import RasterMap2 from "../components/RasterMap2";
// import ExtendedGulfMap from "../components/ExtendedGulfMap";
import D3Heatmap from '../components/EnhancedHeatmap';





const SeaSurfaceTemperatureMap = dynamic(() => import("../components/SSTMap"), {
  ssr: false,
});

export default function Home() {
  // const geoJsonUrl = 'public/GeoJSON/output_gulf_part1.geojson';

  return (
    <div>
      {/* <SSTOverlayMap/> */}
      {/* <D3Heatmap/>
       */}


      <SeaSurfaceTemperatureMap />
    </div>
  );
}
