export default function PersonalDetails() {
  return (
    <div className="space-y-8">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
        <p className="text-sm text-slate-500">Manage the employee's basic identity and contact details.</p>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-8">
        <DetailItem label="First name" value="Mohammed" />
        <DetailItem label="Last name" value="Saraki" />
        <DetailItem label="Phone Number" value="+254 700 000 000" />
        <DetailItem label="National ID" value="12345678" />
      </div>
    </div>
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