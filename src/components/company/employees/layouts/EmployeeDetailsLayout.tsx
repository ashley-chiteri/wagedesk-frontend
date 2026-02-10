import { Outlet, useParams, useNavigate} from "react-router-dom";
import PageTabs from "@/components/common/PageTabs";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function EmployeeDetailsLayout() {
  const { companyId, employeeId } = useParams();
  const navigate = useNavigate();

  // TEMP mock data (replace with fetch later)
  const employee = {
    first_name: "Mohammed",
    last_name: "Saraki",
    email: "mohammed@example.com",
    role: "Supervisor",
    status: "ACTIVE",
  };

  const initials = `${employee.first_name[0]}${employee.last_name[0]}`;

  const tabs = [
    {
      label: "Personal details",
      href: `/company/${companyId}/employees/${employeeId}/personal`,
      exact: true,
    },
    {
      label: "Contracts",
      href: `/company/${companyId}/employees/${employeeId}/contracts`,
    },
    {
      label: "Payments",
      href: `/company/${companyId}/employees/${employeeId}/payments`,
    },
    {
      label: "Deductions",
      href: `/company/${companyId}/employees/${employeeId}/deductions`,
    },
    {
      label: "Allowances",
      href: `/company/${companyId}/employees/${employeeId}/allowances`,
    },
  ];

  return (
    <div className="flex gap-2 items-start max-w-7xl mx-auto">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer shrink-0 sticky top-6"
            onClick={() => navigate(`/company/${companyId}/modules`)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Back</p>
        </TooltipContent>
      </Tooltip>
      {/* Left profile card */}
      <aside className="w-72 shrink-0 bg-white border border-slate-200 rounded-md p-4 sticky top-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center text-xl font-semibold text-indigo-600 ring-4 ring-white">
            {initials}
          </div>

          <h2 className="mt-3 font-semibold text-slate-900">
            {employee.first_name} {employee.last_name}
          </h2>

          <p className="text-xs text-slate-400">{employee.email}</p>

          <Badge
            variant="secondary"
            className="mt-4 px-3 py-1 bg-slate-100 text-slate-600 border-none hover:bg-slate-200"
          >
            {employee.role}
          </Badge>
        </div>
      </aside>

      {/* Right content */}
      <section className="flex-1 space-y-6 ">
        <div className="bg-white shrink-0 border border-slate-200 rounded-md p-4 sticky top-6 mb-8">
          <PageTabs tabs={tabs} />
        </div>

        <div className="bg-white  border border-slate-200 rounded-md overflow-hidden">
          <div className="p-8">
            <Outlet />
          </div>
        </div>
      </section>
    </div>
  );
}
