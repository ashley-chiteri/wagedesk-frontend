import {
  SectionDetailsHeader,
  EditButton,
} from "@/components/company/employees/employeeutils";
export default function EmployeeDeductions() {
  const statutoryDeductions = [
    { name: "PAYE", type: "Formula", value: "Custom" },
    { name: "NSSF", type: "New Rates (Tier I & II)", value: "Custom" },
    { name: "SHIF", type: "Formula", value: "Custom" },
    { name: "Housing Levy", type: "Formula", value: "Custom" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SectionDetailsHeader title="Recurring Deductions" description="Automated payroll deductions for this employee." />
        <EditButton />
      </div>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-900">Name</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Assigned As</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Type</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Value</th>
              <th className="px-6 py-3 font-semibold text-slate-900">Frequency</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {statutoryDeductions.map((item) => (
              <tr key={item.name} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700">{item.name}</td>
                <td className="px-6 py-4 text-slate-500 underline decoration-dotted">Default</td>
                <td className="px-6 py-4 text-slate-500">{item.type}</td>
                <td className="px-6 py-4 text-slate-500">{item.value}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700">
                    Every payroll cycle
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}