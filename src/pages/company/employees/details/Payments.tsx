// components/company/employees/PaymentDetails.tsx
import {
  SectionDetailsHeader,
  EditButton,
} from "@/components/company/employees/employeeutils";
import { useOutletContext } from "react-router-dom";
import { Employee } from "@/types/employees";
import { CreditCard, Smartphone, Wallet, Banknote } from "lucide-react";

interface OutletContext {
  employee: Employee;
}

export default function PaymentDetails() {
  const context = useOutletContext<OutletContext>();
  const employee = context?.employee;
  
  if (!employee?.employee_payment_details) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-100 rounded-xl">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <CreditCard className="w-8 h-8 text-slate-300" />
        </div>
        <h4 className="text-slate-900 font-medium">No payment details found</h4>
        <p className="text-slate-500 text-sm mb-6">This employee doesn't have any payment details configured.</p>
      </div>
    );
  }

  const paymentDetails = employee.employee_payment_details;
  
  const getPaymentMethodIcon = () => {
    switch (paymentDetails.payment_method) {
      case 'BANK': return Banknote;
      case 'MOBILE': return Smartphone;
      case 'CASH': return Wallet;
      default: return CreditCard;
    }
  };
  
  const PaymentMethodIcon = getPaymentMethodIcon();
  
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <SectionDetailsHeader title="Bank Account Details" />
        <EditButton />
      </div>
      
      <div className="bg-linear-to-br from-slate-50 to-indigo-50 p-8 rounded-xl border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white rounded-lg border border-slate-200">
            <PaymentMethodIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">Payment Method</p>
            <p className="text-2xl font-bold text-slate-900">
              {paymentDetails.payment_method}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          {paymentDetails.payment_method === 'BANK' && (
            <>
              <DetailItem label="Bank Name" value={paymentDetails.bank_name || "—"} />
              <DetailItem label="Account Number" value={paymentDetails.account_number || "—"} />
              <DetailItem label="Account Name" value={paymentDetails.account_name || "—"} />
              <DetailItem label="Bank Code" value={paymentDetails.bank_code || "—"} />
              <DetailItem label="Branch Name" value={paymentDetails.branch_name || "—"} />
              <DetailItem label="Branch Code" value={paymentDetails.branch_code || "—"} />
            </>
          )}
          
          {paymentDetails.payment_method === 'MOBILE' && (
            <>
              <DetailItem label="Mobile Type" value={paymentDetails.mobile_type || "—"} />
              <DetailItem label="Phone Number" value={paymentDetails.phone_number || "—"} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// Helper component for crisp data display
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="group">
      <p className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2 group-hover:text-indigo-500 transition-colors">
        {label}
      </p>
      <p className="text-base font-medium text-slate-800 bg-white px-4 py-3 rounded-lg border border-slate-100">
        {value}
      </p>
    </div>
  );
}