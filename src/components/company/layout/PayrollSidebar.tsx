import { NavLink, useParams } from "react-router-dom";
import clsx from "clsx";
import {
  LayoutDashboard,
  PlayCircle,
  Mail,
  BarChart3,
  Settings,
} from "lucide-react";

export default function PayrollSidebar() {
  const { companyId } = useParams();

  const navItems = [
    {
      label: "Overview",
      href: `/company/${companyId}/payroll`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      label: "Run Payroll",
      href: `/company/${companyId}/payroll/run`,
      icon: PlayCircle,
    },
    {
      label: "Send Payslips",
      href: `/company/${companyId}/payroll/payslips`,
      icon: Mail,
    },
    {
      label: "Payroll History",
      href: `/company/${companyId}/payroll/history`,
      icon: BarChart3,
    },
    {
      label: "Settings",
      href: `/company/${companyId}/payroll/settings/benefits`,
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white py-4 h-full overflow-y-auto">
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.exact}
            className={({ isActive }) =>
              clsx(
                "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-[#1F3A8A]/10 text-[#1F3A8A] translate-x-1"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              )
            }
          >
            <item.icon
              className={clsx(
                "mr-3 h-5 w-5 shrink-0 transition-colors",
                "group-hover:text-slate-600"
              )}
            />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
