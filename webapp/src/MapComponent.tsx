import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";
import L, { GeoJSONOptions } from "leaflet";
import {
  RawNeighborhoodProps,
  IncidentFilterProps,
  defaultIncidentFilters,
} from "./types";
import { apiUrl } from "./config.ts";
import IncidentCategoryFilter from "./IncidentCategoryFilter";
import Form from "react-bootstrap/Form";

interface IncidentPointsResp {
  points: [number, number, string][];
}

const HeatmapLayer: React.FC<{
  data: [number, number, number][];
}> = ({ data }) => {
  const map = useMap();

  useEffect(() => {
    let heatLayer: any;
    if (data.length > 0) {
      heatLayer = (L as any).heatLayer(data, { radius: 8 }).addTo(map);
    }

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer);
      }
    };
  }, [data, map]);

  return null;
};

const MapComponent: React.FC<{
  onNeighborhoodClick: (neighborhood: RawNeighborhoodProps) => void;
  onIncidentFilterChange: (incidentFilters: IncidentFilterProps) => void;
}> = ({ onNeighborhoodClick, onIncidentFilterChange }) => {
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(
    null
  );
  const [incidentFilters, setIncidentFilters] = useState<IncidentFilterProps>(
    defaultIncidentFilters()
  );
  const [heatmapData, setHeatmapData] = useState<[number, number, number][]>(
    []
  );
  const [fullHeatmapData, setFullHeatmapData] = useState<
    [number, number, string][]
  >([]);
  const [apiLoading, setApiLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch("/Analysis_Neighborhoods_20240610.geojson")
      .then((response) => response.json())
      .then((data) => setGeojson(data))
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, []);

  useEffect(() => {
    (async () => {
      setApiLoading(true);
      const apiResp = (await fetch(`${apiUrl}/incident-points`).then(
        (response) => response.json()
      )) as IncidentPointsResp;
      setApiLoading(false);
      setFullHeatmapData(apiResp.points);
    })();
  }, []);

  useEffect(() => {
    const pts = fullHeatmapData.filter((pt) =>
      incidentFilters.categories.length > 0
        ? incidentFilters.categories.includes(pt[2])
        : true
    );
    let intensity = 1;
    if (pts.length < 1000) {
      intensity = 5;
    }
    setHeatmapData(pts.map((pt) => [pt[0], pt[1], intensity]));
  }, [incidentFilters, fullHeatmapData]);

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
  const handleIncidentCategorySelect = (categories: string[]) => {
    setIncidentFilters({
      ...incidentFilters,
      categories: categories,
    });
    onIncidentFilterChange({
      ...incidentFilters,
      categories: categories,
    });
  };

  const handleTimePeriodChange = (event: any) => {
    onIncidentFilterChange({
      ...incidentFilters,
      timePeriod: event.target.value,
    });
  };

  return (
    <div className="map-container-wrapper">
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
        {heatmapData.length > 0 && <HeatmapLayer data={heatmapData} />}
      </MapContainer>
      <div className="filter-overlay">
        <div className="map-summary">
          {apiLoading ? (
            <div className="spinner-border" role="status" />
          ) : (
            <div>
              {" "}
              Showing density of map of {heatmapData.length.toLocaleString()}{" "}
              incidents{" "}
            </div>
          )}
        </div>
        <div>
          <p className="time-period-title">Time Period</p>
          <Form className="time-period-form" onChange={handleTimePeriodChange}>
            <Form.Group key="inline-radio" className="mb-3">
              <Form.Check
                inline
                defaultChecked
                label="1 Year"
                value="1YEAR"
                name="time-period"
                type="radio"
                className="custom-check"
              />
              <Form.Check
                inline
                label="3 Months"
                value="3MONTH"
                name="time-period"
                type="radio"
                className="custom-check"
              />
              <Form.Check
                inline
                label="1 Month"
                value="1MONTH"
                name="time-period"
                type="radio"
                className="custom-check"
              />
              <Form.Check
                inline
                label="1 Week"
                value="1WEEK"
                name="time-period"
                type="radio"
                className="custom-check"
              />
            </Form.Group>
          </Form>
        </div>
        <IncidentCategoryFilter onOptionSelect={handleIncidentCategorySelect} />
      </div>
    </div>
  );
};

export default MapComponent;
