import React, { useState } from 'react';
import './App.css';
import MapComponent from './MapComponent';

interface NeighborhoodProps {
  nhood: string;
}

const App: React.FC = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodProps | null>(null);

  const handleNeighborhoodClick = (neighborhood: NeighborhoodProps) => {
    setSelectedNeighborhood(neighborhood);
  };


  return (
    <div className="App" style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1 }}>
        <MapComponent onNeighborhoodClick={handleNeighborhoodClick} />
      </div>
      <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {selectedNeighborhood ? (
          <div>
            <h2>{selectedNeighborhood.nhood}</h2>
            {/* Add more neighborhood details here */}
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
