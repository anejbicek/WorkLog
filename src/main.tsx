import { StrictMode } from "react";

import {
  createRoot,
} from "react-dom/client";

import "./index.css";

import App from "./App";

import {
  WorkOrderProvider,
} from "./context/WorkOrderContext";

import {
  AdminProvider,
} from "./context/AdminContext";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <AdminProvider>
      <WorkOrderProvider>
        <App />
      </WorkOrderProvider>
    </AdminProvider>
  </StrictMode>
);