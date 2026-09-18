import { useEffect, useId, useRef, useState } from 'react';

export type CrudSelectOption = {
  value: string;
  label: string;
};

type CrudSelectProps = {
  id: string;
  value: string;
  options: CrudSelectOption[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export function CrudSelect({ id, value, options, placeholder = '', onChange }: CrudSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={`crud-select${open ? ' crud-select--open' : ''}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        className={`crud-select__btn${selected ? '' : ' crud-select__btn--placeholder'}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((prev) => !prev)}
      >
        {selected?.label ?? placeholder}
      </button>
      {open && (
        <ul id={listId} className="crud-select__menu" role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={`crud-select__option${isSelected ? ' crud-select__option--selected' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
