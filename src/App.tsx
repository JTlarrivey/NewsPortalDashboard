import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import ArticleManager from "./pages/ArticleManager";
import ContentControls from "./pages/ContentControls";
import { LoginForm } from "./components/LoginForm";
import { Menu } from "lucide-react";

const queryClient = new QueryClient();

function AppContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón hamburguesa */}
      <button
        className="md:hidden fixed top-2 left-4 z-50 p-1.5 rounded-md bg-white shadow-md"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir sidebar"
      >
        <Menu className="h-3 w-3 text-gray-700" />
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Fondo semi-transparente cuando sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content con margin left para md+ para dejar espacio a sidebar */}
      <main className="flex-1 overflow-y-auto p-8 md:ml-64">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/articles" element={<ArticleManager />} />
          <Route path="/content" element={<ContentControls />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
