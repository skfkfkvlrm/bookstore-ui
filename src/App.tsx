import { Routes, Route, Navigate } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import ClientApp from "./client/ClientApp";

function App() {
  return (
    <Routes>
      {/* Redirect root to client */}
      <Route path="/" element={<Navigate to="/client" replace />} />

      {/* Admin routes */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Client routes */}
      <Route path="/client/*" element={<ClientApp />} />

      {/* Wildcard Fallback Route */}
      <Route path="*" element={<Navigate to="/client" replace />} />
    </Routes>
  );
}

export default App;
