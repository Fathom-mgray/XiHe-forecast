import React, { useEffect, useState } from 'react';
import { ImageOverlay } from 'react-leaflet';
import L from 'leaflet';

const SSTOverlayLayers = ({ selectedDate }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const bounds = [
    L.latLngBounds(L.latLng(0, -180), L.latLng(83, -30)),
    L.latLngBounds(L.latLng(0, -30), L.latLng(83, 60)),
    L.latLngBounds(L.latLng(0, 60), L.latLng(83, 180)),
    L.latLngBounds(L.latLng(-78, -180), L.latLng(0, -60)),
    L.latLngBounds(L.latLng(-78, -60), L.latLng(0, 20)),
    L.latLngBounds(L.latLng(-78, 20), L.latLng(0, 180))
  ];

  useEffect(() => {
    console.log('Got new date')
    const fetchImages = async () => {
      try {
        console.log('getting new ones')
        const response = await fetch(`http://127.0.0.1:5000/get-images?date=${selectedDate.toISOString().split('T')[0]}`);
        const data = await response.json();
        if (data.status === 'success') {
          setImageUrls(data.images);
        } else {
          console.error('Error fetching images:', data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchImages();
  }, [selectedDate]);

  return (
    <>
      {imageUrls.map((url, index) => (
        <ImageOverlay
          key={index}
          url={url}
          bounds={bounds[index]}
          zIndex={0}
        />
      ))}
    </>
  );
};

export default SSTOverlayLayers;