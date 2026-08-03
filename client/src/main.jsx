import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.jsx";

// VITE_GOOGLE_CLIENT_ID must be set in client/.env
// Get it from: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* GoogleOAuthProvider wraps the entire app so any page can trigger Google login */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
