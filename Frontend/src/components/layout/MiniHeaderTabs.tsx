interface MiniHeaderTabOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface MiniHeaderTabsProps<TValue extends string> {
  value: TValue;
  options: MiniHeaderTabOption<TValue>[];
  onChange: (nextValue: TValue) => void;
  ariaLabel: string;
}

export function MiniHeaderTabs<TValue extends string>({ value, options, onChange, ariaLabel }: MiniHeaderTabsProps<TValue>) {
  return (
    <div className="mini-header" role="tablist" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={option.value === value}
          className={option.value === value ? 'mini-header-button mini-header-button-active' : 'mini-header-button'}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
