import {
  StrictMode,
} from "react";

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

import {
  ProjectProvider,
} from "./context/ProjectContext";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <AdminProvider>
      <WorkOrderProvider>
        <ProjectProvider>
          <App />
        </ProjectProvider>
      </WorkOrderProvider>
    </AdminProvider>
  </StrictMode>
);