"use client";

import { HashRouter } from "react-router-dom";
import { Home } from "./home";

/**
 * Client-side app wrapper with React Router
 * This component handles all client-side routing with hash-based URLs
 */
export function ClientApp() {
  return (
    <HashRouter>
      <Home />
    </HashRouter>
  );
}
