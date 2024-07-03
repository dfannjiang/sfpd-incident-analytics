import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

const IntroModal: React.FC<{
  show: boolean;
  handleClose: () => void;
}> = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton className="bg-dark text-light">
        <Modal.Title>SFPD Incident Analytics</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
        <p>
          Welcome to a live dashboard of SFPD incident analytics. Explore the
          heatmap of incidents and click on the map to see incident analytics
          for a specific neighborhood.
        </p>
        <p>
          Data source:{" "}
          <a
            href="https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783/about_data"
            target="_blank"
            rel="noopener noreferrer"
          >
            SFPD Incidents from DataSF
          </a>
        </p>
        <p>
          See{" "}
          <a
            href="https://github.com/dfannjiang/sf-city-analytics"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repo
          </a>{" "}
          for more technical details.
        </p>
        <p>
          <strong>Important Notice:</strong>
        </p>
        <p>
          This app contains information related to police incidents that may
          include triggering or sensitive terms. Viewer discretion is advised.
        </p>
        <p>
          Please be aware that the data provided by this application is for
          informational purposes only and should not be used for any official or
          legal purposes.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-dark">
        <Button variant="dark" onClick={handleClose} className="modal-button">
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IntroModal;
