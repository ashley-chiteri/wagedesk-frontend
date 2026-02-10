export default function PaymentDetails() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900">
        Payment Information
      </h3>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-slate-400">First name</p>
          <p>Mohammed</p>
        </div>
        <div>
          <p className="text-slate-400">Last name</p>
          <p>Saraki</p>
        </div>
      </div>
    </div>
  );
}
