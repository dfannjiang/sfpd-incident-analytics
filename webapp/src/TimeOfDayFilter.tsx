import { useState, useMemo } from "react";
import { Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaSun, FaMoon } from "react-icons/fa";

const TimeOfDayFilter: React.FC<{
  onTimeOfDayChange: (filterOnDaylight: boolean | null) => void;
}> = ({ onTimeOfDayChange }) => {
  const [daylight, setDaylight] = useState(true);
  const [nighttime, setNighttime] = useState(true);

  const handleDaylightChange = () => {
    if (daylight && !nighttime) {
      // In this case, we're flipping the switches so that
      // we're only filtering on nighttime
      setDaylight(false);
      setNighttime(true);
      onTimeOfDayChange(false);
    } else {
      // In these cases, nighttime must be on
      setDaylight(!daylight);
      if (daylight) {
        // If daylight is being turned off, filter on only night
        onTimeOfDayChange(false);
      } else {
        // If daylight is being turned on, don't filter on time of day
        onTimeOfDayChange(null);
      }
    }
  };

  const handleNighttimeChange = () => {
    console.log("nighttime!!");
    if (!daylight && nighttime) {
      // In this case, we're flipping the switches so that
      // we're only filtering on daylight
      setNighttime(false);
      setDaylight(true);
      onTimeOfDayChange(true);
    } else {
      // In these cases, daytime must be on
      setNighttime(!nighttime);
      if (nighttime) {
        // If nighttime is being turned off, filter on only day
        onTimeOfDayChange(true);
      } else {
        // If nighttime is being turned on, don't filter on time of day
        onTimeOfDayChange(null);
      }
    }
  };

  const daylightTooltip = () => (
    <Tooltip id="sun-tooltip">Include daylight hours</Tooltip>
  );

  const nighttimeTooltip = useMemo(
    () => <Tooltip id="night-tooltip">Include nighttime hours</Tooltip>,
    []
  );

  return (
    <div>
      <p className="time-period-title">Daylight/Nighttime</p>
      <Form style={{ marginLeft: "10px" }}>
        <Form.Group className="d-flex align-items-center">
          <OverlayTrigger
            overlay={<Tooltip id="sun-tooltip">Include daylight hours</Tooltip>}
          >
            <Form.Check
              type="switch"
              id="daylight"
              label={<FaSun />}
              className="me-3"
              onChange={handleDaylightChange}
              checked={daylight}
            />
          </OverlayTrigger>
          <OverlayTrigger
            overlay={
              <Tooltip id="night-tooltip">Include nighttime hours</Tooltip>
            }
          >
            <Form.Check
              type="switch"
              id="nighttime"
              label={<FaMoon />}
              onChange={handleNighttimeChange}
              checked={nighttime}
            />
          </OverlayTrigger>
        </Form.Group>
      </Form>
    </div>
  );
};

export default TimeOfDayFilter;
