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
        <Modal.Title>Welcome to the SF Police Incident Reports App</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
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
        <p>
          For more details and access to the source code, please visit{" "}
          <a
            href="https://github.com/dfannjiang/sf-city-analytics"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub page
          </a>
          .
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
