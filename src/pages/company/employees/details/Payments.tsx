import {
  SectionDetailsHeader,
  EditButton,
} from "@/components/company/employees/employeeutils";
export default function PaymentDetails() {
  return (
    <section>
  <div className="flex justify-between mb-4">
    <SectionDetailsHeader title="Bank Account Details" />
    <EditButton />
  </div>
  <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-lg border border-slate-100">
    <DetailItem label="Bank Name" value="Equity Bank" />
    <DetailItem label="Account Number" value="0123456789012" />
    <DetailItem label="Account Name" value="Mohammed Saraki" />
    <DetailItem label="Payment Method" value="BANK" />
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
