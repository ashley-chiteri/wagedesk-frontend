import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import SplashScreen from "./pages/onboarding/splashScreen";
import LoginPage from "./pages/onboarding/auth/loginPage.tsx";
import RootDashboard from "./pages/dashboard/rootDashboard.tsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import CompanySetup from "./components/dashboard/CompanySetup.tsx";
import { supabase } from "./lib/supabaseClient.ts";

const ProtectedRoute = () => {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);

  // If we are still checking the session, show nothing or a spinner
  if (loading) return null;

  return session ? <Outlet /> : <Navigate to="/login" replace />;
};

const AppRouterWrapper = () => {
  const checkUser = useAuthStore((state) => state.checkUser);
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({
      session,
      user: session?.user ?? null,
    });

    if (session) {
      useAuthStore.getState().loadContext();
    }
  });

  return () => subscription.unsubscribe();
}, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard routes with layouts */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<RootDashboard />} />
            <Route path="/company-setup" element={<CompanySetup />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRouterWrapper;
