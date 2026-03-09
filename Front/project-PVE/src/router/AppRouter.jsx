import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginPage from "../pages/Login/Login";
import DashboardPage from "../pages/Dashboard/Dashboard";
import InfraccionesListPage from "../pages/InfraccionesList/InfraccionesList";
import InfraccionDetailPage from "../pages/InfraccionDetail/InfraccionDetail";
import NuevaInfraccionPage from "../pages/NuevaInfraccion/NuevaInfraccion";
import EncierroDetailPage from "../pages/EncierroDetail/EncierroDetail";
import EncierrosPage from "../pages/Encierros/Encierros";
import UsersDashboard from "../pages/Users/UsersDashboard";
import BitacoraPage from "../pages/Bitacora/Bitacora";
import PublicLayout from "../components/Layout/PublicLayout";
import PrivateLayout from "../components/Layout/PrivateLayout";

const ALL_ROLES = ["admin", "director", "capturista", "actualizador", "encierro"];

/**
 * Route protegida: valida autenticación y (opcionalmente) roles permitidos.
 */
function PrivateRoute({ children, allowedRoles = ALL_ROLES }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Evita que usuarios autenticados entren al login nuevamente.
 */
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/**
 * Define todas las rutas del SPA reutilizando las protecciones declaradas arriba.
 */
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <PublicRoute>
              <PublicLayout />
            </PublicRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route
          element={
            <PrivateRoute allowedRoles={ALL_ROLES}>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["admin", "director"]}>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/infracciones"
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <InfraccionesListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/infracciones/nueva"
            element={
              <PrivateRoute allowedRoles={["admin", "capturista"]}>
                <NuevaInfraccionPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/infracciones/:folio"
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <InfraccionDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/encierros/:folio"
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <EncierroDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/encierros"
            element={
              <PrivateRoute allowedRoles={ALL_ROLES}>
                <EncierrosPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/usuarios"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <UsersDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/bitacora"
            element={
              <PrivateRoute allowedRoles={["admin"]}>
                <BitacoraPage />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
