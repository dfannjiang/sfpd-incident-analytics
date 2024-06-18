import React, { useEffect, useState } from "react";
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
import { apiUrl } from "./config.ts";
import IntroModal from "./IntroModal";

interface LastUpdatedResp {
  lastUpdated: string;
}

const App: React.FC = () => {
  const [selectedNeighborhood, setSelectedNeighborhood] =
    useState<NeighborhoodProps | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [neighborhoodData, setNeighborhoodData] =
    useState<NeighborhoodDataResp | null>(null);
  const [selectNeighborhoodErr, setSelectNeighborhoodErr] =
    useState<boolean>(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const handleIntroModalClose = () => {
    setShowIntroModal(false);
    localStorage.setItem("isFirstVisit", "false");
  };

  const handleIntroModalOpen = () => {
    setShowIntroModal(true);
  };

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit") !== "false";
    if (isFirstVisit) {
      setShowIntroModal(true);
    }
  }, []);

  const handleNeighborhoodClick = (neighborhood: RawNeighborhoodProps) => {
    setSelectedNeighborhood({
      name: neighborhood.nhood,
    });
    setNeighborhoodData(null);
  };

  useEffect(() => {
    (async () => {
      const apiResp = await fetch(`${apiUrl}/data-last-updated`).then(
        (response) => response.json()
      );
      console.log(apiResp);
      const lastUpdated = keysToCamelCase(apiResp) as LastUpdatedResp;
      setLastUpdated(lastUpdated.lastUpdated || "");
    })();
  }, []);

  useEffect(() => {
    if (!selectedNeighborhood) {
      return;
    }
    (async (neighborhood: NeighborhoodProps, categoryFilters: string[]) => {
      try {
        setSelectNeighborhoodErr(false);
        let url = `${apiUrl}/neighborhoods/${encodeURIComponent(
          neighborhood.name
        )}`;
        for (let i = 0; i < categoryFilters.length; i++) {
          if (i > 0) {
            url += "&";
          } else {
            url += "?";
          }
          url += `categories=${categoryFilters[i]}`;
        }
        const apiResp = await fetch(url).then((response) => response.json());
        const neighborhoodData = keysToCamelCase(
          apiResp
        ) as NeighborhoodDataResp;
        console.log(neighborhoodData);
        setNeighborhoodData(neighborhoodData);
      } catch (err) {
        console.error("Error fetching neighborhood details:", err);
        setSelectNeighborhoodErr(true);
      }
    })(selectedNeighborhood, categoryFilters);
  }, [selectedNeighborhood, categoryFilters]);

  const handleIncidentCategorySelect = (categories: string[]) => {
    setCategoryFilters(categories);
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <IntroModal show={showIntroModal} handleClose={handleIntroModalClose} />
      <div className="incident-map-container">
        <MapComponent
          onNeighborhoodClick={handleNeighborhoodClick}
          onCategoryFilterSelect={handleIncidentCategorySelect}
        />
      </div>
      <div className="details-container">
        <div className="details-content">
          {selectedNeighborhood && selectNeighborhoodErr ? (
            <div>
              <h2>{selectedNeighborhood.name} District</h2>
              <p>
                Data could not be fetched for {selectedNeighborhood.name}.
                Please try again later.
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
                Click on a neighborhood on the map to see information about
                police incident reports in that area.
              </p>
            </div>
          )}
        </div>
        <div className="footer">
          <div className="last-updated-str">
            {lastUpdated.length > 0
              ? `Data last updated: ${new Date(lastUpdated).toDateString()}`
              : "Data last updated:"}
          </div>
          <div style={{ marginLeft: "2px" }}>Reporting period: past year</div>
          <button onClick={handleIntroModalOpen}>About</button>
        </div>
      </div>
    </div>
  );
};

export default App;
