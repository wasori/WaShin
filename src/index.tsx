import { createRoot } from "react-dom/client"; // `ReactDOM.createRoot` 대신 `createRoot`를 직접 가져옵니다.
import App from "./App";

const root = createRoot( document.getElementById("root") as HTMLElement);

root.render(
    <App />
);