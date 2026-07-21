import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { isNative } from "./lib/platform";

// Register native deep-link handler for OAuth returns. No-op on web.
if (isNative) {
  // Lets CSS target the packaged app only, so app-shell behaviour (no
  // rubber-band scrolling, no tap highlight) never leaks onto the website.
  document.documentElement.classList.add("native");
  import("./lib/platform/oauth").then(({ setupDeepLinks }) => setupDeepLinks());
} else {
  // Web only: expose site actions to in-browser AI agents via WebMCP.
  // No-op unless the browser implements navigator.modelContext.
  import("./lib/webmcp").then(({ setupWebMCP }) => setupWebMCP());
}

createRoot(document.getElementById("root")!).render(<App />);
