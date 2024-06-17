import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";

const IntroModal = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const isFirstVisit = localStorage.getItem("isFirstVisit") !== "false";
    if (isFirstVisit) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("isFirstVisit", "false");
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Welcome to the SF Police Incident Reports App</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
          The incident report data displayed in this app covers incidents from
          the past year only.
        </p>
        <p>
          For more details and access the source code, please visit{" "}
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
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default IntroModal;
