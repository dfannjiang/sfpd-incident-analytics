import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { GeoJSONOptions } from "leaflet";
import { RawNeighborhoodProps } from "./types";

const MapComponent: React.FC<{
  onNeighborhoodClick: (neighborhood: RawNeighborhoodProps) => void;
}> = ({ onNeighborhoodClick }) => {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(
    null
  );

  useEffect(() => {
    fetch("/Analysis_Neighborhoods_20240610.geojson")
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const properties = feature.properties as RawNeighborhoodProps;
    console.log(properties);
    if (properties && properties.nhood) {
      const popupContent = `
        <div>
          <h3>${properties.nhood}</h3>
        </div>
      `;
      layer.bindPopup(popupContent);
      layer.on({
        click: () => {
          console.log(properties);
          onNeighborhoodClick(properties);
        },
      });
    }
  };

  const geoJsonStyle: GeoJSONOptions = {
    style: {
      color: "#424242", // Gray color for the border
      weight: 3, // Border thickness
      opacity: 0.5, // Border opacity
      fillColor: "#808080", // Gray color for the fill
      fillOpacity: 0.2, // Fill opacity (almost transparent)
    },
    onEachFeature,
  };

  return (
    <MapContainer
      center={[37.7749, -122.4194]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojson && <GeoJSON data={geojson} {...geoJsonStyle} />}
    </MapContainer>
  );
};

export default MapComponent;
