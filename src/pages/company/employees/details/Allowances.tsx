import { Inbox } from "lucide-react";
import {
  SectionDetailsHeader,
} from "@/components/company/employees/employeeutils";

export default function EmployeeAllowances() {
  return (
    <div className="space-y-6">
       <SectionDetailsHeader title="Allowances" />
       <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-xl">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <Inbox className="w-8 h-8 text-slate-300" />
          </div>
          <h4 className="text-slate-900 font-medium">No allowances found</h4>
          <p className="text-slate-500 text-sm mb-6">This employee doesn't have any active allowances.</p>
          <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            + Add First Allowance
          </button>
       </div>
    </div>
  );
}