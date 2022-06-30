import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  return (
    <div
      style={{
        color: "red",
        fontSize: "24px",
        width: "320px",
        height: "320px",
      }}
    >
      rakumo-de-extension popup
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
);
