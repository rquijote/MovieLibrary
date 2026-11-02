import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { getMediaYearBounds } from '../../lib/media';
import type { MediaItem } from '../../types/media';
import './YearRangeFilter.css';

export function YearRangeFilter({ min, max, label, items }: {
  min?: number;
  max?: number;
  label: string;
  items: MediaItem[];
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
  const commitSlider = (input: HTMLInputElement) => {
    if (pendingSubmit.current !== null) clearTimeout(pendingSubmit.current);
    if (input.form?.checkValidity()) input.form.requestSubmit();
  };
  const validMinimum = /^[1-9]\d{3}$/.test(minimum) ? Number(minimum) : undefined;
  const validMaximum = /^[1-9]\d{3}$/.test(maximum) ? Number(maximum) : undefined;
  const bounds = getMediaYearBounds(items);
  const start = bounds?.min ?? 0;
  const end = bounds?.max ?? 0;
  const clampYear = (year: number) => Math.min(end, Math.max(start, year));
  const lower = clampYear(validMinimum ?? start);
  const upper = Math.max(lower, clampYear(validMaximum ?? end));
  const span = end - start || 1;
  const style = {
    '--range-start': `${(lower - start) / span * 100}%`,
    '--range-end': `${(upper - start) / span * 100}%`,
  } as CSSProperties;

  return (
    <fieldset className="year-range-filter">
      <legend>{label}</legend>
      <div className="year-range-boxes">
        <label>From
          <input name="yearMin" type="text" inputMode="numeric" pattern="[0-9]{4}"
            placeholder={bounds ? String(start) : 'Year'} value={minimum}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setMinimum(event.target.value);
              scheduleSubmit(event.currentTarget);
            }} />
        </label>
        <span aria-hidden="true">to</span>
        <label>To
          <input name="yearMax" type="text" inputMode="numeric" pattern="[0-9]{4}"
            placeholder={bounds ? String(end) : 'Year'} value={maximum}
            onChange={(event) => {
              event.currentTarget.setCustomValidity('');
              setMaximum(event.target.value);
              scheduleSubmit(event.currentTarget);
            }} />
        </label>
      </div>
      {!bounds ? <p className="muted">No release years available.</p> : null}
      <div className="year-range-track" style={style}>
        <input aria-label={`Earliest year for ${label.toLowerCase()}`} type="range"
          disabled={!bounds || start === end}
          min={start} max={end} value={lower}
          onPointerUp={(event) => commitSlider(event.currentTarget)}
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
              commitSlider(event.currentTarget);
            }
          }}
          onChange={(event) => {
            if (pendingSubmit.current !== null) clearTimeout(pendingSubmit.current);
            setMinimum(String(Math.min(Number(event.target.value), upper)));
          }} />
        <input aria-label={`Latest year for ${label.toLowerCase()}`} type="range"
          disabled={!bounds || start === end}
          min={start} max={end} value={upper}
          onPointerUp={(event) => commitSlider(event.currentTarget)}
          onKeyUp={(event) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)) {
              commitSlider(event.currentTarget);
            }
          }}
          onChange={(event) => {
            if (pendingSubmit.current !== null) clearTimeout(pendingSubmit.current);
            setMaximum(String(Math.max(Number(event.target.value), lower)));
          }} />
      </div>
    </fieldset>
  );
}
