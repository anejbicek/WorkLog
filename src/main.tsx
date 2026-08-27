import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";

import { WorkOrderProvider } from "./context/WorkOrderContext";

createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <WorkOrderProvider>
      <App />
    </WorkOrderProvider>
  </StrictMode>
);