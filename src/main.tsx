import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register Firebase messaging service worker
if ("serviceWorker" in navigator && !window.location.hostname.includes("id-preview--")) {
  navigator.serviceWorker.register("/firebase-messaging-sw.js").catch(console.error);
}

createRoot(document.getElementById("root")!).render(<App />);
