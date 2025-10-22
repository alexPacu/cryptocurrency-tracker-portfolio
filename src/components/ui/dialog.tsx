import * as React from "react";

export const Dialog: React.FC<React.PropsWithChildren<{ open?: boolean; onOpenChange?: (v: boolean) => void }>> = ({ children }) => (
  <div>{children}</div>
);
export const DialogTrigger: React.FC<React.PropsWithChildren<{ asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, asChild, ...props }) => {
  const child = React.Children.only(children) as React.ReactElement;
  if (asChild && React.isValidElement(child)) {
    return React.cloneElement(child, props as any);
  }
  return <button {...props}>{children}</button>;
};
export const DialogContent: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children }) => <div>{children}</div>;
export const DialogHeader: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;
export const DialogFooter: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;
export const DialogTitle: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <h3>{children}</h3>;

export default Dialog;
