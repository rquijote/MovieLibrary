import { useEffect, useRef, useState } from 'react';
import './YearRangeFilter.css';

export function YearRangeFilter({ min, max, label }: {
  min?: number;
  max?: number;
  label: string;
}) {
  const [minimum, setMinimum] = useState(min === undefined ? '' : String(min));
  const [maximum, setMaximum] = useState(max === undefined ? '' : String(max));
  const pendingSubmit = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (pendingSubmit.current !== null) clearTimeout(pendingSubmit.current);
  }, []);

  const scheduleSubmit = (input: HTMLInputElement) => {
    if (pendingSubmit.current !== null) clearTimeout(pendingSubmit.current);
    const form = input.form;
    pendingSubmit.current = setTimeout(() => {
      if (form?.isConnected && form.checkValidity()) form.requestSubmit();
    }, 400);
  };
  return (
    <fieldset className="year-range-filter">
      <legend>{label}</legend>
      <div className="year-range-boxes">
        <label>
          <span className="year-range-field-label">From</span>
          <input name="yearMin" type="text" autoComplete="off" inputMode="numeric" pattern="[0-9]{4}"
            placeholder="Any year" value={minimum}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setMinimum(event.target.value);
              scheduleSubmit(event.currentTarget);
            }} />
        </label>
        <span aria-hidden="true">–</span>
        <label>
          <span className="year-range-field-label">To</span>
          <input name="yearMax" type="text" autoComplete="off" inputMode="numeric" pattern="[0-9]{4}"
            placeholder="Any year" value={maximum}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setMaximum(event.target.value);
              scheduleSubmit(event.currentTarget);
            }} />
        </label>
      </div>
    </fieldset>
  );
}
