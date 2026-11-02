export interface ActionToastMessage {
  id: number;
  kind: 'success' | 'error' | 'pending';
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
      <div className={`action-toast action-toast-${toast.kind}`}>
        <p>{toast.message}</p>
        <div
          className="action-toast-progress" // This class defines the animation counting down. It is full width initially, but scales x from 1 to 0.
          style={{ animationDuration: `${durationMs}ms` }} 
          onAnimationEnd={() => onDismiss(toast.id)}
        />
      </div>
    </div>
  );
}
