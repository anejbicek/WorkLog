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

import {
  ThemeProvider,
} from "./context/ThemeContext";

createRoot(
  document.getElementById(
    "root"
  )!
).render(
  <StrictMode>
    <AdminProvider>
      <ThemeProvider>
        <WorkOrderProvider>
          <ProjectProvider>
            <App />
          </ProjectProvider>
        </WorkOrderProvider>
      </ThemeProvider>
    </AdminProvider>
  </StrictMode>
);