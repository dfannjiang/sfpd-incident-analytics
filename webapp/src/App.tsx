import React, { useEffect, useState } from "react";
import MapComponent from "./MapComponent";
import NeighborhoodDetails from "./NeighborhoodDetails";
import keysToCamelCase from "./keysToCamelCase";
import {
  RawNeighborhoodProps,
  NeighborhoodProps,
  NeighborhoodDataResp,
  IncidentFilterProps,
  defaultIncidentFilters,
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
  const [incidentFilters, setIncidentFilters] = useState<IncidentFilterProps>(
    defaultIncidentFilters()
  );
  const [neighborhoodData, setNeighborhoodData] =
    useState<NeighborhoodDataResp | null>(null);
  const [selectNeighborhoodErr, setSelectNeighborhoodErr] =
    useState<boolean>(false);
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

      // If date is in the future according to local time zone,
      // assume its in UTC.
      if (new Date(lastUpdated.lastUpdated) > new Date()) {
        setLastUpdated(new Date(lastUpdated.lastUpdated + "Z"));
      } else {
        setLastUpdated(new Date(lastUpdated.lastUpdated));
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedNeighborhood) {
      return;
    }
    (async (
      neighborhood: NeighborhoodProps,
      incidentFilters: IncidentFilterProps
    ) => {
      try {
        const categoryFilters = incidentFilters.categories;
        setSelectNeighborhoodErr(false);
        let url = `${apiUrl}/neighborhoods/${encodeURIComponent(
          neighborhood.name
        )}`;
        let params = new URLSearchParams();
        for (let i = 0; i < categoryFilters.length; i++) {
          params.append("categories", categoryFilters[i]);
        }
        params.append("time_period", incidentFilters.timePeriod);
        if (incidentFilters.filterOnDaylight != null) {
          params.append(
            "is_daylight",
            incidentFilters.filterOnDaylight.toString()
          );
        }
        const rawResp = await fetch(url + "?" + params.toString());
        const apiResp = await rawResp.json();
        if (!rawResp.ok) {
          // resp is not OK (e.g., 404, 500, etc.)
          setSelectNeighborhoodErr(true);
          console.error(
            `HTTP error! Response: ${rawResp.status}. Error: ${apiResp.detail}`
          );
        }
        const neighborhoodData = keysToCamelCase(
          apiResp
        ) as NeighborhoodDataResp;
        console.log(neighborhoodData);
        setNeighborhoodData(neighborhoodData);
      } catch (err) {
        console.error("Error fetching neighborhood details:", err);
        setSelectNeighborhoodErr(true);
      }
    })(selectedNeighborhood, incidentFilters);
  }, [selectedNeighborhood, incidentFilters]);

  const handleIncidentFilterChange = (incidentFilters: IncidentFilterProps) => {
    setIncidentFilters(incidentFilters);
  };

  const timePeriodDesc = (timePeriod: string) => {
    switch (timePeriod) {
      case "1YEAR":
        return "past year";
      case "3MONTH":
        return "past 3 months";
      case "1MONTH":
        return "past month";
      case "1WEEK":
        return "past week";
    }
  };

  return (
    <div className="App" style={{ display: "flex", height: "100vh" }}>
      <IntroModal show={showIntroModal} handleClose={handleIntroModalClose} />
      <div className="incident-map-container">
        <MapComponent
          onNeighborhoodClick={handleNeighborhoodClick}
          onIncidentFilterChange={handleIncidentFilterChange}
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
              <NeighborhoodDetails
                neighborhoodData={neighborhoodData}
                incidentFilters={incidentFilters}
              />
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
          <div style={{ marginLeft: "2px" }}>
            Showing data for the {timePeriodDesc(incidentFilters.timePeriod)}
          </div>
          <div className="last-updated-str">
            {lastUpdated && `Data last updated: ${lastUpdated.toDateString()}`}
          </div>
          <button onClick={handleIntroModalOpen}>About</button>
        </div>
      </div>
    </div>
  );
};

export default App;
