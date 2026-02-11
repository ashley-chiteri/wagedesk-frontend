import { User, Contact, Fingerprint } from "lucide-react";
import { SectionDetailsHeader, EditButton } from "@/components/company/employees/employeeutils";

export default function PersonalDetails() {
  return (
    <div className="space-y-12">
      <div className="flex justify-between items-start">
        <div className="space-y-10 flex-1">
          {/* Section 1: Identity */}
          <section>
            <SectionDetailsHeader title="Identity" icon={User} />
            <div className="grid grid-cols-3 gap-8">
              <DetailItem label="Full Name" value="Mohammed Saraki" />
              <DetailItem label="Gender" value="Male" />
              <DetailItem label="Date of Birth" value="12th June 1992" />
              <DetailItem label="Marital Status" value="Single" />
              <DetailItem label="Citizenship" value="Kenyan" />
            </div>
          </section>

          {/* Section 2: Contact */}
          <section>
            <SectionDetailsHeader title="Contact Information" icon={Contact} />
            <div className="grid grid-cols-3 gap-8">
              <DetailItem label="Phone Number" value="+254 700 000 000" />
              <DetailItem label="Personal Email" value="mohammed@example.com" />
            </div>
          </section>

          {/* Section 3: Statutory IDs */}
          <section>
            <SectionDetailsHeader title="Statutory Identifiers" icon={Fingerprint} />
            <div className="grid grid-cols-3 gap-8">
              <DetailItem label="National ID / Passport" value="12345678" />
              <DetailItem label="KRA PIN" value="A001234567Z" />
              <DetailItem label="NSSF Number" value="NS998877" />
              <DetailItem label="SHIF Number" value="SH445566" />
            </div>
          </section>
        </div>
        <EditButton />
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