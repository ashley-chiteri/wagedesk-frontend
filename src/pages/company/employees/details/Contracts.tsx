// components/company/employees/ContractDetails.tsx
import {
  SectionDetailsHeader,
  EditButton,
} from "@/components/company/employees/employeeutils";
import { useOutletContext } from "react-router-dom";
import { Employee } from "@/types/employees";
import { Calendar, FileText, Clock, CheckCircle, XCircle } from "lucide-react";

interface OutletContext {
  employee: Employee;
}

export default function ContractDetails() {
  const context = useOutletContext<OutletContext>();
  const employee = context?.employee;
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getActiveContract = () => {
    if (!employee?.employee_contracts?.length) return null;
    return employee.employee_contracts.find(contract => 
      contract.contract_status === 'ACTIVE'
    ) || employee.employee_contracts[0];
  };

  const activeContract = getActiveContract();

  if (!activeContract) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-xl">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <FileText className="w-8 h-8 text-slate-300" />
        </div>
        <h4 className="text-slate-900 font-medium">No contracts found</h4>
        <p className="text-slate-500 text-sm mb-6">This employee doesn't have any contracts.</p>
      </div>
    );
  }

  const StatusIcon = activeContract.contract_status === 'ACTIVE' ? CheckCircle : XCircle;
  const statusColor = activeContract.contract_status === 'ACTIVE' 
    ? 'text-green-600 bg-green-50' 
    : 'text-red-600 bg-red-50';

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <SectionDetailsHeader title="Current Employment Contract" />
        <EditButton />
      </div>
      
      <div className="bg-linear-to-br from-slate-50 to-indigo-50 p-8 rounded-xl border border-slate-100">
        {/* Contract Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-slate-900">
                {activeContract.contract_type}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {activeContract.contract_status}
              </span>
            </div>
            <p className="text-slate-500">Contract ID: {activeContract.id}</p>
          </div>
          
          {employee.employee_contracts.length > 1 && (
            <div className="text-right">
              <p className="text-sm text-slate-400">
                {employee.employee_contracts.length} total contracts
              </p>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all contracts →
              </button>
            </div>
          )}
        </div>
        
        {/* Contract Details Grid */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Start Date</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDate(activeContract.start_date)}
                </p>
              </div>
            </div>
            
            <DetailItem 
              label="Contract Type" 
              value={activeContract.contract_type} 
            />
            <DetailItem 
              label="Contract Status" 
              value={activeContract.contract_status} 
              badge={true}
            />
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Probation Ends</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatDate(activeContract.probation_end_date) || "No probation"}
                </p>
              </div>
            </div>
            
            <DetailItem 
              label="End Date" 
              value={formatDate(activeContract.end_date) || "Indefinite"} 
            />
            
            {activeContract.end_date && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  {new Date(activeContract.end_date) > new Date() 
                    ? `Expires in ${Math.ceil((new Date(activeContract.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                    : "Expired"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper component for crisp data display
function DetailItem({ label, value, badge = false }: { 
  label: string; 
  value: string; 
  badge?: boolean;
}) {
  return (
    <div className="group">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors">
        {label}
      </p>
      {badge ? (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
          {value}
        </span>
      ) : (
        <p className="text-base font-medium text-slate-800 bg-white px-4 py-3 rounded-lg border border-slate-100">
          {value}
        </p>
      )}
    </div>
  );
}