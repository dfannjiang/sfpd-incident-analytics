import React, { useState } from "react";
import MapComponent from "./MapComponent";
import NeighborhoodDetails from "./NeighborhoodDetails";
import keysToCamelCase from "./keysToCamelCase";
import {
  RawNeighborhoodProps,
  NeighborhoodProps,
  NeighborhoodDataResp,
} from "./types";
import { Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App: React.FC = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<NeighborhoodProps | null>(null);
  const [neighborhoodData, setNeighborhoodData] =
    useState<NeighborhoodDataResp | null>(null);
  const [selectNeighborhoodErr, setSelectNeighborhoodErr] =
    useState<boolean>(false);

  const handleNeighborhoodClick = (neighborhood: RawNeighborhoodProps) => {
    setSelectedNeighborhood({
      name: neighborhood.nhood,
    });
    setNeighborhoodData(null);
    (async () => {
      try {
        setSelectNeighborhoodErr(false);
        const apiResp = await fetch(
          `http://localhost:8000/neighborhoods/${encodeURIComponent(
            neighborhood.nhood
          )}`
        ).then((response) => response.json());
        console.log(apiResp);
        const neighborhoodData = keysToCamelCase(
          apiResp
        ) as NeighborhoodDataResp;
        console.log(neighborhoodData);
        setNeighborhoodData(neighborhoodData);
      } catch (err) {
        console.error("Error fetching neighborhood details:", err);
        setSelectNeighborhoodErr(true);
      }
    })();
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <div className="incident-map-container">
        <MapComponent onNeighborhoodClick={handleNeighborhoodClick} />
      </div>
      <div className="details-container">
        {selectedNeighborhood && selectNeighborhoodErr ? (
          <div>
            <h2>{selectedNeighborhood.name} District</h2>
            <p>
              Data could not be fetched for {selectedNeighborhood.name}. Please
              try again later.
            </p>
          </div>
        ) : selectedNeighborhood && neighborhoodData ? (
          <div className="neighborhood-detail-container">
            <h2>{selectedNeighborhood.name} District</h2>
            <NeighborhoodDetails {...neighborhoodData} />
          </div>
        ) : selectedNeighborhood ? (
          <div>
            <h2>{selectedNeighborhood.name} District</h2>
            <div className="details-spinner">
              <Spinner animation="border" />
            </div>
          </div>
        ) : (
          <div>
            <h2>Select a neighborhood</h2>
            <p>
              Click on a neighborhood on the map to see information about police
              incident reports in that area.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
