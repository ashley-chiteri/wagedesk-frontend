import { useParams } from "react-router-dom";
import { OtherDeductionsTable } from "@/components/payroll/settings/DeductionsTable";
export default function DeductionSettings() {
    const { companyId } = useParams<{companyId: string;}>();
  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-medium text-slate-900">
        Deduction settings
      </h2>
      <div >
        <OtherDeductionsTable companyId={companyId as string} />
      </div>
      
    </div>
  );
}
