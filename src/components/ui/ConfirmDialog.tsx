import Modal from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  dangerous?: boolean;
}

export default function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = '确认', dangerous,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">{message}</p>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost text-sm" onClick={onClose}>取消</button>
        <button
          className={dangerous
            ? 'bg-red-500 text-white rounded-btn px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors'
            : 'btn-primary text-sm'
          }
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
