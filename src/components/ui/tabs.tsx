import * as React from "react";

export const Tabs: React.FC<React.PropsWithChildren<{ defaultValue?: string; className?: string }>> = ({ children, className }) => (
  <div className={className}>{children}</div>
);
export const TabsList: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div className="flex">{children}</div>;
export const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { value?: string }> = ({ children, ...props }) => (
  <button {...props}>{children}</button>
);
export const TabsContent: React.FC<React.PropsWithChildren<{ value?: string }>> = ({ children }) => <div>{children}</div>;

export default Tabs;
