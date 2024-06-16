import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";
import L, { GeoJSONOptions } from "leaflet";
import { RawNeighborhoodProps } from "./types";

interface IncidentPointsResp {
  points: [number, number][];
}

const HeatmapLayer: React.FC<{
  data: [number, number][];
  isVisible: boolean;
}> = ({ data, isVisible }) => {
  const map = useMap();

  useEffect(() => {
    let heatLayer: any;
    if (isVisible && data.length > 0) {
      heatLayer = (L as any).heatLayer(data, { radius: 8 }).addTo(map);
    }

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, isVisible, map]);

  return null;
};

const DensityMapToggle: React.FC<{
  onDensityMapToggleClick: () => void;
  isVisible: boolean;
}> = ({ onDensityMapToggleClick, isVisible }) => {
  const map = useMap();
  useEffect(() => {
    const button = L.DomUtil.create(
      "button",
      "leaflet-bar leaflet-control leaflet-control-custom"
    );
    button.innerHTML = isVisible
      ? "Hide density of incidents"
      : "Show density of incidents";
    button.onclick = onDensityMapToggleClick;

    // Define the custom control class
    const CustomControl = L.Control.extend({
      onAdd: function () {
        return button;
      },
      onRemove: function () {
        // No-op
      },
    });

    const customControl = new CustomControl({ position: "topright" });

    customControl.onAdd = function () {
      return button;
    };

    customControl.addTo(map);

    return () => {
      map.removeControl(customControl);
    };
  }, [map, onDensityMapToggleClick, isVisible]);

  return null;
};

const MapComponent: React.FC<{
  onNeighborhoodClick: (neighborhood: RawNeighborhoodProps) => void;
}> = ({ onNeighborhoodClick }) => {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(
    null
  );
  const [heatmapData, setHeatmapData] = useState<[number, number][]>([]);
  const [showDensityMap, setShowDensityMap] = useState<boolean>(false);

  useEffect(() => {
    fetch("/Analysis_Neighborhoods_20240610.geojson")
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  useEffect(() => {
    (async () => {
      const apiResp = (await fetch(
        "http://localhost:8000/incident-points"
      ).then((response) => response.json())) as IncidentPointsResp;
      setHeatmapData(apiResp.points);
    })();
  }, []);

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const properties = feature.properties as RawNeighborhoodProps;
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

  const toggleDensityMapVisibility = () => {
    setShowDensityMap(!showDensityMap);
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
      {heatmapData.length > 0 && (
        <HeatmapLayer data={heatmapData} isVisible={showDensityMap} />
      )}
      <DensityMapToggle
        onDensityMapToggleClick={toggleDensityMapVisibility}
        isVisible={showDensityMap}
      />
    </MapContainer>
  );
};

export default MapComponent;
