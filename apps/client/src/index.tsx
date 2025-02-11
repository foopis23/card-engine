import { createRoot } from "react-dom/client";
import App from "./App";
import '../socket';
import { getUserId } from "./util/userId";

document.addEventListener("DOMContentLoaded", () => {
	getUserId();
	const root = createRoot(document.getElementById("app")!);
	root.render(<App />);
});
