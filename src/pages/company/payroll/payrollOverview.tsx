import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const COLORS = [
  "#0f172a",
  "#334155",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
];

const payrollSummary = {
  employeesPaid: 42,
  grossPay: 5_420_000,
  netPay: 4_120_000,
  statutory: 820_000,
  status: "APPROVED",
};

const payrollBreakdown = [
  { name: "Basic Salary", value: 3_600_000 },
  { name: "Cash Allowances", value: 980_000 },
  { name: "Non-Cash Benefits", value: 320_000 },
  { name: "Deductions", value: 520_000 },
];

const statutoryBreakdown = [
  { name: "PAYE", value: 420_000 },
  { name: "NSSF", value: 160_000 },
  { name: "SHIF", value: 90_000 },
  { name: "Housing Levy", value: 110_000 },
  { name: "HELB", value: 40_000 },
];

const netPayByDepartment = [
  { department: "Engineering", netPay: 1_820_000 },
  { department: "Finance", netPay: 820_000 },
  { department: "HR", netPay: 460_000 },
  { department: "Sales", netPay: 1_020_000 },
];

const currency = (value: number) =>
  `KES ${value.toLocaleString()}`;

const PayrollOverview = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-slate-900">
        Payroll Overview
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard title="Employees Paid" value={payrollSummary.employeesPaid} />
        <StatCard title="Gross Pay" value={currency(payrollSummary.grossPay)} />
        <StatCard title="Net Pay" value={currency(payrollSummary.netPay)} />
        <StatCard title="Statutory Deductions" value={currency(payrollSummary.statutory)} />
        <Card className="rounded-md border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">
              Payroll Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-slate-800">
              {payrollSummary.status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payroll Breakdown */}
        <ChartCard title="Payroll Cost Breakdown">
          <DonutChart data={payrollBreakdown} />
        </ChartCard>

        {/* Statutory */}
        <ChartCard title="Statutory Deductions">
          <DonutChart data={statutoryBreakdown} />
        </ChartCard>

        {/* Net Pay by Department */}
        <ChartCard title="Net Pay by Department">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={netPayByDepartment}>
              <XAxis dataKey="department" />
              <YAxis tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                formatter={(v: number) => currency(v)}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="netPay" radius={[6, 6, 0, 0]}>
                {netPayByDepartment.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default PayrollOverview;

/* ---------- Helpers ---------- */

const StatCard = ({ title, value }: { title: string; value: any }) => (
  <Card className="rounded-md border">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-slate-500">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="text-lg font-semibold text-slate-900">
      {value}
    </CardContent>
  </Card>
);

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card className="rounded-md border">
    <CardHeader>
      <CardTitle className="text-sm font-medium text-slate-700">
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const DonutChart = ({ data }: { data: any[] }) => (
  <ResponsiveContainer width="100%" height={260}>
    <PieChart>
      <Pie
        data={data}
        innerRadius={60}
        outerRadius={90}
        dataKey="value"
        paddingAngle={2}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(v: number) => currency(v)}
        contentStyle={{
          borderRadius: 8,
          borderColor: "#e5e7eb",
        }}
      />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
);
