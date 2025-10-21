import * as React from "react";

export const TooltipProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <>{children}</>;

export const Tooltip = ({ children }: any) => <>{children}</>;
export const TooltipTrigger = ({ children }: any) => <>{children}</>;
export const TooltipContent = ({ children }: any) => <div className="tooltip">{children}</div>;

export default Tooltip;
