import { Form } from "react-bootstrap";

const TimePeriodFilter: React.FC<{
  onTimePeriodChange: (event: any) => void;
}> = ({ onTimePeriodChange }) => {
  return (
    <div>
      <p className="time-period-title">Time Period</p>
      <Form className="time-period-form" onChange={onTimePeriodChange}>
        <Form.Group key="inline-radio" className="mb-3">
          <Form.Check
            inline
            defaultChecked
            label="1 Year"
            value="1YEAR"
            name="time-period"
            type="radio"
            className="custom-check"
          />
          <Form.Check
            inline
            label="3 Months"
            value="3MONTH"
            name="time-period"
            type="radio"
            className="custom-check"
          />
          <Form.Check
            inline
            label="1 Month"
            value="1MONTH"
            name="time-period"
            type="radio"
            className="custom-check"
          />
          <Form.Check
            inline
            label="1 Week"
            value="1WEEK"
            name="time-period"
            type="radio"
            className="custom-check"
          />
        </Form.Group>
      </Form>
    </div>
  );
};

export default TimePeriodFilter;
