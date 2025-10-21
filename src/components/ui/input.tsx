import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("border px-3 py-2 rounded w-full", className)} {...props} />
));
Input.displayName = "Input";

export default Input;
