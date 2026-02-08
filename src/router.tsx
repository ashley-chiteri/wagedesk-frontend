import { HashRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";
import SplashScreen from "./pages/onboarding/splashScreen";
import LoginPage from "./pages/onboarding/auth/loginPage.tsx";
import RootDashboard from "./pages/dashboard/rootDashboard.tsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import AccountSettings from "./pages/dashboard/AccountSettings.tsx";
import CompanySetup from "./components/dashboard/CompanySetup.tsx";
import { supabase } from "./lib/supabaseClient.ts";
import ModuleDashboard from "./pages/company/layout/moduleDashboard.tsx";
import ModuleLayout from "./pages/company/layout/moduleLayout.tsx";
import EmployeeLayout from "./pages/company/employees/employeeLayout.tsx";
import EmployeeSection from "./pages/company/employees/employeeSection.tsx";
import NonActiveEmployees from "./pages/company/employees/nonActiveEmployees.tsx";
import TerminatedEmployees from "./pages/company/employees/TerminatedEmployees.tsx";
import PayrollLayout from "./pages/company/payroll/PayrollLayout.tsx";
import RunPayroll from "./pages/company/payroll/runPayroll.tsx";
import PayrollHistory from "./pages/company/payroll/PayrollHistory.tsx";
import PayrollSettings from "./pages/company/payroll/PayrollSettings.tsx";
import SendPayslip from "./pages/company/payroll/SendPayslips.tsx";
import PayrollOverview from "./pages/company/payroll/payrollOverview.tsx";
import ReportLayout from "./pages/company/reports/ReportLayout.tsx";
import ReportOverview from "./pages/company/reports/ReportOverview.tsx";
import OverviewLayout from "./pages/company/reports/OverviewLayout.tsx";
import InternalReports from "./pages/company/reports/InternalReports.tsx";
import PaymentsReports from "./pages/company/reports/PaymentsReport.tsx";
import AnnualReports from "./pages/company/reports/AnnualReports.tsx";
import P9AReports from "./pages/company/reports/P9A-Reports.tsx";
import SettingsLayout from "./pages/company/settings/SettingsLayout.tsx";
import SettingsOverview from "./pages/company/settings/SettiingsOverview.tsx";
import HRMSettings from "./pages/company/settings/HRM.tsx";
import ProfileSettings from "./pages/company/settings/ProfilesSettings.tsx";

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
            <Route
              path="/dashboard/account-settings"
              element={<AccountSettings />}
            />
            <Route path="/company-setup" element={<CompanySetup />} />
          </Route>
          {/* Company-specific Dashboard with a Company ID parameter */}
          <Route path="/company/:companyId" element={<ModuleLayout />}>
            <Route index element={<Navigate to="modules" replace />} />
            <Route path="modules" element={<ModuleDashboard />} />
            <Route element={<EmployeeLayout />}>
              <Route path="employees" element={<EmployeeSection />} />
              <Route
                path="employees/non-active"
                element={<NonActiveEmployees />}
              />
              <Route
                path="employees/terminated"
                element={<TerminatedEmployees />}
              />
            </Route>
            {/**Payroll specific dashboards */}
            <Route path="payroll" element={<PayrollLayout />}>
              <Route index element={<PayrollOverview />} />
              <Route path="run" element={<RunPayroll />} />
              <Route path="payslips" element={<SendPayslip />} />
              <Route path="history" element={<PayrollHistory />} />
              <Route path="settings" element={<PayrollSettings />} />
            </Route>
            {/**Report specific dashboards */}
            <Route path="reports" element={<ReportLayout />}>
              <Route index element={<ReportOverview />} />
              <Route path="overview" element={<OverviewLayout />}>
                <Route path="statutory" element={<ReportOverview />} />
                <Route path="payments" element={<PaymentsReports />} />
                <Route path="internal" element={<InternalReports />} />
              </Route>
              <Route path="overview" element={<ReportOverview />} />
              <Route path="annual" element={<AnnualReports />} />
              <Route path="p9a" element={<P9AReports />} />
            </Route>
            {/**Report specific dashboards */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<SettingsOverview />} />
              <Route path="overview" element={<SettingsOverview />} />
              <Route path="profiles" element={<ProfileSettings />} />
              <Route path="hrm" element={<HRMSettings />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRouterWrapper;
