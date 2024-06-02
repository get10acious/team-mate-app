import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { WebSocketProvider } from "./context/webSocketContext.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <App />
    </WebSocketProvider>
  </React.StrictMode>
);
