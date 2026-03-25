import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Subscriptions } from "./pages/Subscriptions";
import { Settings } from "./pages/Settings";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { EmailTemplates } from "./pages/EmailTemplates";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "subscriptions", Component: Subscriptions },
      { path: "settings", Component: Settings },
      { path: "profile", Component: Profile },
      { path: "email-templates", Component: EmailTemplates },
    ],
  },
]);