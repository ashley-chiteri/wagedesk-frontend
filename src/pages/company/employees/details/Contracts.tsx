import {
  SectionDetailsHeader,
  EditButton,
} from "@/components/company/employees/employeeutils";
export default function ContractDetails() {
  return (
    <section>
  <div className="flex justify-between">
    <SectionDetailsHeader title="Employment Terms" />
    <EditButton />
  </div>
  <div className="grid grid-cols-2 gap-8">
    <DetailItem label="Contract Type" value="Permanent" />
    <DetailItem label="Hire Date" value="Jan 01, 2024" />
    <DetailItem label="Probation End" value="Apr 01, 2024" />
    <DetailItem label="Status" value="ACTIVE" />
  </div>
</section>
  );
}

// Helper component for crisp data display
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-1 group-hover:text-indigo-500 transition-colors">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
