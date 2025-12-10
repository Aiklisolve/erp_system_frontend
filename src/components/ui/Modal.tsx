import { ReactNode } from 'react';

type ModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  hideCloseButton?: boolean;
};

export function Modal({ title, open, onClose, children, hideCloseButton = false }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[95vh] rounded-xl border border-slate-200 bg-white shadow-xl animate-fade-in flex flex-col m-2 sm:m-4">
        <div className="flex-shrink-0 mb-3 flex items-center justify-between gap-4 p-3 sm:p-4 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900 truncate pr-2">{title}</h2>
          {!hideCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:border-primary hover:text-primary transition-colors flex-shrink-0"
            >
              Close
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3 sm:pb-4 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}


