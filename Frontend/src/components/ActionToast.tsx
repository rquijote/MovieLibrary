export interface ActionToastMessage {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

interface ActionToastProps {
  toast: ActionToastMessage | null;
  durationMs?: number;
  onDismiss: (toastId: number) => void;
}

export function ActionToast({ toast, durationMs = 4000, onDismiss }: ActionToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div className="action-toast-container" key={toast.id} role="status" aria-live="polite">
      <div className={toast.kind === 'error' ? 'action-toast action-toast-error' : 'action-toast action-toast-success'}>
        <p>{toast.message}</p>
        <div
          className="action-toast-progress"
          style={{ animationDuration: `${durationMs}ms` }}
          onAnimationEnd={() => onDismiss(toast.id)}
        />
      </div>
    </div>
  );
}
