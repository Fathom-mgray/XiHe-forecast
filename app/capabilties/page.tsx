'use client';

import React, { useState, useEffect } from 'react';

const WMTSCapabilitiesViewer = () => {
    const [capabilities, setCapabilities] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [parsedData, setParsedData] = useState(null);

    useEffect(() => {
        const fetchCapabilities = async () => {
            try {
                const url = 'http://localhost:8080/geoserver/gwc/service/wmts' +
                    '?REQUEST=GetCapabilities' +
                    '&SERVICE=WMTS' +
                    '&VERSION=1.0.0';

                const response = await fetch(url);
                const text = await response.text();
                setCapabilities(text);

                // Parse XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, "text/xml");

                // Extract layer info
                const layers = xmlDoc.getElementsByTagName('Layer');
                const layerInfo = Array.from(layers).map(layer => {
                    const identifier = layer.getElementsByTagName('ows:Identifier')[0]?.textContent;
                    const styles = Array.from(layer.getElementsByTagName('Style')).map(style => 
                        style.getElementsByTagName('ows:Identifier')[0]?.textContent
                    );
                    const tileMatrixSets = Array.from(layer.getElementsByTagName('TileMatrixSet')).map(tms => 
                        tms.textContent
                    );
                    const formats = Array.from(layer.getElementsByTagName('Format')).map(format => 
                        format.textContent
                    );

                    return {
                        identifier,
                        styles,
                        tileMatrixSets,
                        formats
                    };
                });

                // Extract TileMatrixSet info
                const tileMatrixSets = Array.from(xmlDoc.getElementsByTagName('TileMatrixSet')).map(tms => {
                    const identifier = tms.getElementsByTagName('ows:Identifier')[0]?.textContent;
                    const matrices = Array.from(tms.getElementsByTagName('TileMatrix')).map(matrix => ({
                        identifier: matrix.getElementsByTagName('ows:Identifier')[0]?.textContent,
                        scaleDenominator: matrix.getElementsByTagName('ScaleDenominator')[0]?.textContent,
                        topLeftCorner: matrix.getElementsByTagName('TopLeftCorner')[0]?.textContent,
                        tileWidth: matrix.getElementsByTagName('TileWidth')[0]?.textContent,
                        tileHeight: matrix.getElementsByTagName('TileHeight')[0]?.textContent,
                        matrixWidth: matrix.getElementsByTagName('MatrixWidth')[0]?.textContent,
                        matrixHeight: matrix.getElementsByTagName('MatrixHeight')[0]?.textContent,
                    }));

                    return {
                        identifier,
                        matrices
                    };
                });

                setParsedData({ layers: layerInfo, tileMatrixSets });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCapabilities();
    }, []);

    if (loading) return <div>Loading capabilities...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ 
            padding: '20px',
            maxHeight: '80vh',
            overflow: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h2>WMTS Capabilities</h2>
            
            {parsedData && (
                <div>
                    <h3>Available Layers</h3>
                    {parsedData.layers.map((layer, index) => (
                        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
                            <h4>Layer: {layer.identifier}</h4>
                            <div>
                                <strong>Styles:</strong> {layer.styles.join(', ') || 'No styles'}
                            </div>
                            <div>
                                <strong>TileMatrixSets:</strong> {layer.tileMatrixSets.join(', ')}
                            </div>
                            <div>
                                <strong>Formats:</strong> {layer.formats.join(', ')}
                            </div>
                        </div>
                    ))}

                    <h3>TileMatrixSets</h3>
                    {parsedData.tileMatrixSets.map((tms, index) => (
                        <div key={index} style={{ marginBottom: '20px', padding: '10px', border: '1px solid #eee' }}>
                            <h4>TileMatrixSet: {tms.identifier}</h4>
                            <details>
                                <summary>Available Matrices ({tms.matrices.length})</summary>
                                <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                                    {tms.matrices.map((matrix, idx) => (
                                        <div key={idx} style={{ margin: '5px 0', fontSize: '0.9em' }}>
                                            <strong>ID:</strong> {matrix.identifier}<br />
                                            <strong>Scale:</strong> {matrix.scaleDenominator}<br />
                                            <strong>Size:</strong> {matrix.matrixWidth}x{matrix.matrixHeight}
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            )}

            <details>
                <summary>Raw XML Response</summary>
                <pre style={{ 
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    maxHeight: '400px',
                    overflow: 'auto',
                    padding: '10px',
                    backgroundColor: '#f5f5f5'
                }}>
                    {capabilities}
                </pre>
            </details>
        </div>
    );
};

export default WMTSCapabilitiesViewer;