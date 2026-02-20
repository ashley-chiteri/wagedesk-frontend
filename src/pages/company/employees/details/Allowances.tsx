import { Inbox } from "lucide-react";
import {
  SectionDetailsHeader,
} from "@/components/company/employees/employeeutils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function EmployeeAllowances() {
  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <SectionDetailsHeader title="Allowances" description="Automated payroll benefits for this employee." />
       <Button 
           onClick={() => toast.info("Assigning benefits is disabled for the demo")}
           className="flex bg-transparent items-center cursor-pointer gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-all shadow-none">
             <Plus  />
             Add
           </Button>
       </div>
       
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