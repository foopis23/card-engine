import { createRoot } from "react-dom/client";
import App from "./App";
import './socket';

document.addEventListener("DOMContentLoaded", () => {
	const root = createRoot(document.getElementById("app")!);
	root.render(<App />);
});
