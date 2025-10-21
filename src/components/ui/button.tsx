import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  return (
    <button ref={ref} className={cn("inline-flex items-center rounded px-3 py-2 bg-gray-100 hover:bg-gray-200", className)} {...props}>
      {children}
    </button>
  );
});
Button.displayName = "Button";

export default Button;
