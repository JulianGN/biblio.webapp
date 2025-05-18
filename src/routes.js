import { gestorRoutes } from "./routes-gestor.js";
import { authRoutes } from "./routes-auth.js";

export function router({
  gestorController,
  gestorView,
  authController,
  authView,
  navigate,
}) {
  if (gestorRoutes({ gestorController, gestorView, navigate })) return;
  if (authRoutes({ authController, authView, navigate })) return;
  // Fallback: login
  navigate("/login");
}
