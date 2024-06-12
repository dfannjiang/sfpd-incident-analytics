import React, { useState } from "react";
import "./App.css";
import MapComponent from "./MapComponent";
import NeighborhoodDetails from "./NeighborhoodDetails";
import { RawNeighborhoodProps, NeighborhoodProps } from "./types";

const App: React.FC = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<NeighborhoodProps | null>(null);

  const handleNeighborhoodClick = (neighborhood: RawNeighborhoodProps) => {
    setSelectedNeighborhood({
      name: neighborhood.nhood,
    });
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        <MapComponent onNeighborhoodClick={handleNeighborhoodClick} />
      </div>
      <div style={{ flex: 1, padding: "20px", overflow: "auto" }}>
        {selectedNeighborhood ? (
          <NeighborhoodDetails name={selectedNeighborhood.name} />
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
