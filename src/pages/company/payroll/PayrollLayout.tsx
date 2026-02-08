import { Outlet, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PayrollSidebar from "@/components/company/layout/PayrollSidebar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PayrollLayout() {
  const { companyId } = useParams();
  const navigate = useNavigate();

  return (
    <section className="flex h-full bg-gray-50 overflow-hidden">
      {/* Sidebar (sticky, non-scrolling) */}
      <PayrollSidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full  overflow-hidden">
        {/* Header */}
        <header className="shrink-0 px-6 pt-5 pb-4  border-slate-200 ">
          <div className="flex items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => navigate(`/company/${companyId}/modules`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                  <p>Back</p>
                </TooltipContent>
            </Tooltip>

            <h1 className="text-2xl font-semibold text-slate-900">Payroll</h1>
          </div>

          <p className="text-sm text-slate-00 pl-11 mt-1">
            Run payroll, send payslips, and manage payroll records.
          </p>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <Outlet />
        </div>
      </div>
    </section>
  );
}
