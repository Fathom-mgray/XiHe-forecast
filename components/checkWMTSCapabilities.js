// utils/wmtsCapabilities.js
export const checkWMTSCapabilities = async () => {
    const geoserverUrl = process.env.NEXT_PUBLIC_GEOSERVER_URL;
    const capabilitiesUrl = `${geoserverUrl}/gwc/service/wmts?` +
        'SERVICE=WMTS' +
        '&REQUEST=GetCapabilities' +
        '&VERSION=1.0.0';

    try {
        const response = await fetch(capabilitiesUrl);
        const text = await response.text();
        console.log('WMTS Capabilities:', text);
        return text;
    } catch (error) {
        console.error('Error fetching WMTS capabilities:', error);
        return null;
    }
};