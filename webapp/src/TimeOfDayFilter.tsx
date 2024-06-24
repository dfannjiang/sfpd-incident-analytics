import { useState } from "react";
import { Form } from "react-bootstrap";
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

  return (
    <div>
      <Form>
        <Form.Group className="d-flex flex-row">
          <Form.Group
            className="d-flex flex-column"
            style={{ marginLeft: "10px" }}
          >
            <Form.Label className="time-period-title m-0">
              Daylight hours
            </Form.Label>
            <Form.Check
              type="switch"
              id="daylight"
              label={<FaSun />}
              onChange={handleDaylightChange}
              checked={daylight}
            />
          </Form.Group>
          <Form.Group
            className="d-flex flex-column"
            style={{ marginLeft: "10px" }}
          >
            <Form.Label className="time-period-title m-0">
              Nighttime hours
            </Form.Label>
            <Form.Check
              type="switch"
              id="nighttime"
              label={<FaMoon />}
              onChange={handleNighttimeChange}
              checked={nighttime}
            />
          </Form.Group>
        </Form.Group>
        .
      </Form>
    </div>
  );
};

export default TimeOfDayFilter;
