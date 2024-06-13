import React, { useState } from "react";
import "./App.css";
import MapComponent from "./MapComponent";
import NeighborhoodDetails from "./NeighborhoodDetails";
import keysToCamelCase from "./keysToCamelCase";
import {
  RawNeighborhoodProps,
  NeighborhoodProps,
  NeighborhoodDataResp,
} from "./types";

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
      <div style={{ flex: 1 }}>
        <MapComponent onNeighborhoodClick={handleNeighborhoodClick} />
      </div>
      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        {selectedNeighborhood && selectNeighborhoodErr ? (
          <div>
            <h2>{selectedNeighborhood.name}</h2>
            <p>
              Data could not be fetched for {selectedNeighborhood.name}. Please
              try again later.
            </p>
          </div>
        ) : selectedNeighborhood && neighborhoodData ? (
          <div>
            <h2>{selectedNeighborhood.name}</h2>
            <NeighborhoodDetails {...neighborhoodData} />
          </div>
        ) : selectedNeighborhood ? (
          <div>
            <h2>{selectedNeighborhood.name}</h2>
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            <h2>Select a neighborhood</h2>
            <p>Click on a neighborhood on the map to see more information.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
