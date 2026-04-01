import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface AppModalProps {
  open: boolean;
  isClosing: boolean;
  onRequestClose: () => void;
  disableClose?: boolean;
  showCloseButton?: boolean;
  closeAriaLabel?: string;
  positionClassName?: string;
  overlayClassName?: string;
  maxWidthClassName?: string;
  panelClassName?: string;
  children: ReactNode;
}

export default function AppModal({
  open,
  isClosing,
  onRequestClose,
  disableClose = false,
  showCloseButton = true,
  closeAriaLabel = 'Cerrar modal',
  positionClassName = 'fixed inset-0',
  overlayClassName = '',
  maxWidthClassName = 'max-w-md',
  panelClassName = 'bg-white/92 backdrop-blur-md',
  children,
}: AppModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={`${isClosing ? 'modal-fade-out' : 'modal-fade-in'} ${positionClassName} z-50 flex items-center justify-center bg-[#020817]/55 px-4 backdrop-blur-sm ${overlayClassName}`}
      onClick={() => {
        if (!disableClose) {
          onRequestClose();
        }
      }}
    >
      <div
        className={`${isClosing ? 'modal-pop-out' : 'modal-pop-in'} w-full ${maxWidthClassName} rounded-[28px] border border-slate-200 p-6 text-slate-900 shadow-2xl ${panelClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onRequestClose}
            disabled={disableClose}
            className="ml-auto flex text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
            aria-label={closeAriaLabel}
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
