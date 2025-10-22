import * as React from "react";

export type ToastVariant = "default" | "destructive" | string;
export type ToastProps = React.HTMLAttributes<HTMLDivElement> & { open?: boolean; onOpenChange?: (open: boolean) => void; variant?: ToastVariant };

export const ToastProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;

export const ToastViewport: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ position: "fixed", top: 0, right: 0, zIndex: 100 }}>{children}</div>
);

export const Toast: React.FC<ToastProps> = ({ children, ...props }) => (
  <div role="status" {...props} className={props.className}>
    {children}
  </div>
);

export const ToastAction: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);

export const ToastClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button {...props} aria-label="close">
    {children ?? "x"}
  </button>
);

export const ToastTitle: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div className="font-semibold">{children}</div>;
export const ToastDescription: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;

export default Toast;

export type ToastActionElement = React.ReactElement<typeof ToastAction>;
