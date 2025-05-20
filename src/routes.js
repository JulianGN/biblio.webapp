import { gestorRoutes } from "./routes-gestor.js";
import { authRoutes } from "./routes-auth.js";

export async function router({
  gestorController,
  gestorView,
  authController,
  authView,
  navigate,
}) {
  const isGestorRoute = await gestorRoutes({
    gestorController,
    gestorView,
    navigate,
  });
  if (isGestorRoute) return;

  const isAuthRoute = await authRoutes({ authController, authView, navigate });
  if (isAuthRoute) return;
  // Fallback: login
  navigate("/login");
}
