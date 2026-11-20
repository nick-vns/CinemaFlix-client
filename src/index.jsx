import React from "react";
import { createRoot } from "react-dom/client";
import { MainView } from "./components/main-view/main-view.jsx";
import "./index.css";

createRoot(document.querySelector("#root")).render(<MainView />);
