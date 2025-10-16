"use client";

import { BrowserRouter } from "react-router-dom";
import { ReactNode } from "react";

interface RouterProviderProps {
  children: ReactNode;
}

/**
 * Client-side router provider for React Router
 * Wraps the app with BrowserRouter to enable client-side routing
 */
export function RouterProvider({ children }: RouterProviderProps) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
