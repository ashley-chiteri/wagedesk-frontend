import { Outlet, useParams } from "react-router-dom";
import PageTabs from "@/components/common/PageTabs";

export default function PayrollSettingsLayout() {
  const { companyId } = useParams();

  const tabs = [
    {
      label: "Benefits",
      href: `/company/${companyId}/payroll/settings/benefits`,
      exact: true,
    },
    {
      label: "Dedutions",
      href: `/company/${companyId}/payroll/settings/deductions`,
    },
    {
      label: "Reviewers",
      href: `/company/${companyId}/payroll/settings/reviewers`,
    },
  ];

  return (
    <div className="h-full p-4">
       <section className="h-full bg-white border border-slate-200 rounded-md flex flex-col overflow-hidden">
        {/* The Tab Navigation */}
        <div className="px-6 pt-6 shrink-0">
          <PageTabs tabs={tabs} />
        </div>

        {/* This renders the actual page component (EmployeeSection, etc.) */}
         <div className="flex-1 overflow-y-auto min-h-0 px-6">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
