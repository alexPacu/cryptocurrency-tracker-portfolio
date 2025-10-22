import * as React from "react";

export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, ...props }) => (
  <label {...props} className={"block text-sm font-medium text-muted-foreground"}>
    {children}
  </label>
);

export default Label;
