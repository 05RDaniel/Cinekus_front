import { useEffect } from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  closeAriaLabel: string;
  confirmingLabel?: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  closeAriaLabel,
  confirmingLabel,
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirming) onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isConfirming, onCancel]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="confirm-modal-backdrop"
        aria-hidden="true"
        onClick={isConfirming ? undefined : onCancel}
      />
      <div className="confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-modal-title" aria-describedby="confirm-modal-message">
        <div className="confirm-modal__dialog">
          <div className="confirm-modal__header">
            <h2 id="confirm-modal-title" className="confirm-modal__title">
              {title}
            </h2>
            <button
              type="button"
              className="crud-modal__close"
              aria-label={closeAriaLabel}
              onClick={onCancel}
              disabled={isConfirming}
            />
          </div>
          <p id="confirm-modal-message" className="confirm-modal__message">
            {message}
          </p>
          <div className="confirm-modal__footer">
            <button
              type="button"
              className="admin-btn admin-btn--ghost"
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--danger"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming && confirmingLabel ? confirmingLabel : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
