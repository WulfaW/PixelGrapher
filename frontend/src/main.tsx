import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { wakeBackend } from "./lib/api";

wakeBackend();

createRoot(document.getElementById("root")!).render(
	<App />
);
