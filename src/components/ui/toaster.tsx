import * as React from "react";
import { useToast } from "../../hooks/use-toast";
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id}>
          {t.title && <ToastTitle>{t.title}</ToastTitle>}
          {t.description && <ToastDescription>{t.description}</ToastDescription>}
          <ToastClose onClick={() => t.onOpenChange?.(false)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}

export default Toaster;
