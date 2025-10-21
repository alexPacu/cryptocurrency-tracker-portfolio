import * as React from "react";
import { cn } from "../../lib/utils";

// Minimal dropdown API that matches the imports used in Navbar
export const DropdownMenu: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;
export const DropdownMenuTrigger: React.FC<React.PropsWithChildren<any>> = ({ children }) => <>{children}</>;
export const DropdownMenuContent: React.FC<React.PropsWithChildren<any>> = ({ children }) => (
  <div className={cn("bg-white border shadow p-2 rounded")}>{children}</div>
);
export const DropdownMenuItem: React.FC<React.PropsWithChildren<any>> = ({ children, ...props }) => (
  <div className={cn("px-2 py-1 text-sm hover:bg-gray-100")} {...props}>
    {children}
  </div>
);

// Export other names used in the repo as simple passthroughs
export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuLabel: React.FC<any> = ({ children }) => <div className="px-2 py-1 text-xs font-semibold">{children}</div>;
export const DropdownMenuSeparator: React.FC<any> = () => <div className="my-1 h-px bg-gray-100" />;
export const DropdownMenuGroup: React.FC<React.PropsWithChildren<{}>> = ({ children }) => <div>{children}</div>;
export const DropdownMenuPortal = ({ children }: any) => <>{children}</>;
export const DropdownMenuSub = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuSubTrigger = ({ children }: any) => <>{children}</>;
export const DropdownMenuSubContent = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuRadioGroup = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuShortcut = ({ children }: any) => <span className="ml-auto text-xs">{children}</span>;

export default DropdownMenu;
