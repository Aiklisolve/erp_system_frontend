// Simple toast notification system
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private toasts: Map<string, HTMLDivElement> = new Map();

  show({ message, type = 'info', duration = 3000 }: ToastOptions) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const toast = this.createToastElement(message, type);
    
    // Add to DOM
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    this.toasts.set(id, toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      this.remove(id);
    }, duration);
    
    return id;
  }

  private createToastElement(message: string, type: ToastType): HTMLDivElement {
    const toast = document.createElement('div');
    toast.className = `
      px-4 py-3 rounded-lg shadow-lg text-sm font-medium
      transition-all duration-300 ease-out
      opacity-0 transform translate-x-full
      max-w-md
      ${this.getTypeClasses(type)}
    `.trim().replace(/\s+/g, ' ');
    
    const icon = this.getIcon(type);
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
    `;
    
    return toast;
  }

  private getTypeClasses(type: ToastType): string {
    const classes = {
      success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      error: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-amber-50 text-amber-800 border border-amber-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200'
    };
    return classes[type];
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type];
  }

  private remove(id: string) {
    const toast = this.toasts.get(id);
    if (toast) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
        this.toasts.delete(id);
      }, 300);
    }
  }

  success(message: string, duration?: number) {
    return this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    return this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number) {
    return this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number) {
    return this.show({ message, type: 'info', duration });
  }
}

export const toast = new ToastManager();

