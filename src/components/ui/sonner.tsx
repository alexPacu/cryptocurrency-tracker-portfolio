import * as React from "react";

export const Toaster = (props: any) => {
  return null;
};

export const toast = {
  success: (msg: string) => console.log("toast:", msg),
  error: (msg: string) => console.error("toast:", msg),
};

export default Toaster;
