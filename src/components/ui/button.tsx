import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, disabled, ...props }, ref) => {
  const base = "inline-flex items-center rounded px-3 py-2 text-sm font-medium transition-colors focus:outline-none";
  const enabled = "bg-gray-100 hover:bg-gray-200 text-black";
  const disabledCls = "opacity-60 cursor-not-allowed pointer-events-none";

  return (
    <button
      ref={ref}
      className={cn(base, disabled ? disabledCls : enabled, className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = "Button";

export default Button;
