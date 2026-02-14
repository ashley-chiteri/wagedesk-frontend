import { useParams } from "react-router-dom";
import { AllowanceTable } from "@/components/payroll/settings/BenefitsTable";
export default function BenefitSettings() {
   const { companyId } = useParams<{companyId: string;}>();

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-medium text-slate-900">
        Benefit settings
      </h2>

     <AllowanceTable companyId={companyId as string} />
    </div>
  );
}
