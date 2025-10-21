import * as React from "react";

// Minimal shim for Sonner Toaster used in App — no external dependency.
export const Toaster = (props: any) => {
  return null; // no-op
};

export const toast = {
  // minimal API
  success: (msg: string) => console.log("toast:", msg),
  error: (msg: string) => console.error("toast:", msg),
};

export default Toaster;
