import { FormEvent, ReactNode } from 'react';

export type CrudModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  closeAriaLabel: string;
  children: ReactNode;
  error?: string | null;
  isSaving?: boolean;
  size?: 'default' | 'lg' | 'xl';
  scrollable?: boolean;
  onSubmit?: (event: FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  savingLabel?: string;
  footer?: ReactNode;
};

export function CrudModal({
  isOpen,
  title,
  onClose,
  closeAriaLabel,
  children,
  error,
  isSaving = false,
  size = 'default',
  onSubmit,
  submitLabel,
  cancelLabel,
  savingLabel,
  footer,
}: CrudModalProps) {
  if (!isOpen) return null;

  const dialogClass = [
    'crud-modal__dialog',
    size === 'lg' ? 'crud-modal__dialog--lg' : '',
    size === 'xl' ? 'crud-modal__dialog--xl' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const body = (
    <>
      {error && <div className="crud-modal__error">{error}</div>}
      {children}
    </>
  );

  const defaultFooter =
    onSubmit && cancelLabel && submitLabel ? (
      <>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={onClose}
          disabled={isSaving}
        >
          {cancelLabel}
        </button>
        <button type="submit" className="admin-btn" disabled={isSaving}>
          {isSaving && savingLabel ? savingLabel : submitLabel}
        </button>
      </>
    ) : null;

  return (
    <>
      <div className="crud-modal-backdrop" aria-hidden="true" onClick={isSaving ? undefined : onClose} />
      <div className="crud-modal" tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}>
        <div className={dialogClass}>
          <div className="crud-modal__header">
            <h2 className="crud-modal__title">{title}</h2>
            <button
              type="button"
              className="crud-modal__close"
              aria-label={closeAriaLabel}
              onClick={onClose}
              disabled={isSaving}
            />
          </div>
          {onSubmit ? (
            <form className="crud-modal__form" onSubmit={onSubmit}>
              <div className="crud-modal__body">{body}</div>
              <div className="crud-modal__footer">{footer ?? defaultFooter}</div>
            </form>
          ) : (
            <>
              <div className="crud-modal__body">{body}</div>
              {footer && <div className="crud-modal__footer">{footer}</div>}
            </>
          )}
        </div>
      </div>
    </>
  );
}
