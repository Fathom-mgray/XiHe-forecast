import React, { useState, useEffect } from 'react';
import { ImageOverlay } from 'react-leaflet';

const TimeDisplay = ({ time }) => {
  if (!time) return null;
  const date = new Date(time);
  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '30px',
      zIndex: 1000
    }}>
      {date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })}
    </div>
  );
};

const Legend = ({ imagePath }) => {
  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      zIndex: 1000
    }}>
      <img src={imagePath} alt="Legend" style={{ maxWidth: '400px', maxHeight: '300px' }} />
    </div>
  );
};

const AnimatedMapLayer = ({ bounds, opacity = 1, interval = 200 }) => {
  const [imagePaths, setImagePaths] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [times, setTimes] = useState([]);
  const [legendPath, setLegendPath] = useState('');

  useEffect(() => {
    // Generate image paths for wind data
    const generatedPaths = Array.from({ length: 24 }, (_, i) => 
      `/images/ssh_${(i + 1).toString().padStart(3, '0')}.png`
    );
    setImagePaths(generatedPaths);

    // Set legend path
    setLegendPath('/images/ssh_legend.png');

    // Set time array
    const timeArray = [
      '2024-10-08T03:00:00.000000000', '2024-10-08T06:00:00.000000000',
      '2024-10-08T09:00:00.000000000', '2024-10-08T12:00:00.000000000',
      '2024-10-08T15:00:00.000000000', '2024-10-08T18:00:00.000000000',
      '2024-10-08T21:00:00.000000000', '2024-10-09T00:00:00.000000000',
      '2024-10-09T03:00:00.000000000', '2024-10-09T06:00:00.000000000',
      '2024-10-09T09:00:00.000000000', '2024-10-09T12:00:00.000000000',
      '2024-10-09T15:00:00.000000000', '2024-10-09T18:00:00.000000000',
      '2024-10-09T21:00:00.000000000', '2024-10-10T00:00:00.000000000',
      '2024-10-10T03:00:00.000000000', '2024-10-10T06:00:00.000000000',
      '2024-10-10T09:00:00.000000000', '2024-10-10T12:00:00.000000000',
      '2024-10-10T15:00:00.000000000', '2024-10-10T18:00:00.000000000',
      '2024-10-10T21:00:00.000000000', '2024-10-11T00:00:00.000000000'
    ];
    setTimes(timeArray);
  }, []);

  useEffect(() => {
    if (imagePaths.length === 0) return;
    const animationInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === imagePaths.length - 1 ? 0 : prevIndex + 1
      );
    }, interval);
    return () => clearInterval(animationInterval);
  }, [imagePaths, interval]);

  if (imagePaths.length === 0) return null;

  return (
    <>
      <ImageOverlay
        url={imagePaths[currentImageIndex]}
        bounds={bounds}
        opacity={opacity}
      />
      <TimeDisplay time={times[currentImageIndex]} />
      {legendPath && <Legend imagePath={legendPath} />}
    </>
  );
};

export default AnimatedMapLayer;