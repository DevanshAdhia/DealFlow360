import { useToastContext } from '../context/ToastContext.jsx';

export const useToast = () => {
  const { addToast, removeToast } = useToastContext();

  return {
    toast: addToast,
    dismiss: removeToast,
    success: (title, message, duration) => addToast({ type: 'success', title, message, duration }),
    error: (title, message, duration) => addToast({ type: 'error', title, message, duration }),
    warning: (title, message, duration) => addToast({ type: 'warning', title, message, duration }),
    info: (title, message, duration) => addToast({ type: 'info', title, message, duration })
  };
};
