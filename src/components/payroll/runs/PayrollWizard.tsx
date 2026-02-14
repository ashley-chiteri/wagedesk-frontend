import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  CheckCircle,
  CreditCard,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import PreparationLayout from "@/pages/company/payroll/runs/PayrollPreparationLayout";

function ReviewApproveTable() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-medium">Reviewer</TableHead>
            <TableHead className="font-medium">Level</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Items Reviewed</TableHead>
            <TableHead className="font-medium">Last Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12 text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-slate-300" />
                <p>No reviews in progress</p>
                <p className="text-sm">Awaiting review assignments</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function ApprovePaymentsTable() {
  return (
    <div className="border border-slate-200 rounded-md overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="font-medium">Payment Method</TableHead>
            <TableHead className="font-medium">Total Amount</TableHead>
            <TableHead className="font-medium">Recipients</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Scheduled Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} className="text-center py-12 text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <CreditCard className="h-8 w-8 text-slate-300" />
                <p>No payments scheduled</p>
                <p className="text-sm">Complete review to process payments</p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

function PayslipTable() {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/70 backdrop-blur-sm">
          <TableRow>
            <TableHead className="font-medium">Employee</TableHead>
            <TableHead className="font-medium">Payslip Period</TableHead>
            <TableHead className="font-medium">Gross Pay</TableHead>
            <TableHead className="font-medium">Net Pay</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium">Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-8 w-8 text-slate-300" />
                <p>No payslips generated</p>
                <p className="text-sm">
                  Payslips will appear after payment approval
                </p>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// Top Stepper Component
function TopStepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, title: "Prepare" },
    { number: 2, title: "Review" },
    { number: 3, title: "Payments" },
    { number: 4, title: "Payslips" },
  ];

  return (
    <div className="relative mt-2">
      {/* Background line */}
      <div className="absolute top-4 left-0 w-full h-px bg-slate-200" />

      {/* Active line */}
      <div
        className="absolute top-4 left-0 h-px bg-indigo-700 transition-all duration-500"
        style={{
          width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
        }}
      />

      <div className="relative flex justify-between">
        {steps.map((step) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-all duration-300",
                  isCompleted && "bg-indigo-700 border-indigo-700 text-white",
                  isActive && "border-indigo-700 text-indigo-700 bg-white",
                  !isActive &&
                    !isCompleted &&
                    "border-slate-300 text-slate-400 bg-white",
                )}
              >
                {step.number}
              </div>

              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive ? "text-slate-900" : "text-slate-500",
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PayrollWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { companyId, payrollRunId } = useParams<{
    companyId: string;
    payrollRunId: string;
  }>();
  const totalSteps = 4;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Render the appropriate table based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PreparationLayout />;
      case 2:
        return <ReviewApproveTable />;
      case 3:
        return <ApprovePaymentsTable />;
      case 4:
        return <PayslipTable />;
      default:
        return null;
    }
  };

  return (
    <main className="h-screen flex flex-col bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-2 py-3">
          <div className="flex items-center justify-between mb-3">
            <Tooltip>
              <TooltipTrigger asChild className="absolute left-6 top-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => navigate(`/company/${companyId}/payroll/${payrollRunId}/review-status`)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Back</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                    Payroll Run
                  </h1>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border-0"
                >
                  Step {currentStep} / {totalSteps}
                </Badge>
              </div>

              {/* Top Stepper */}
              <TopStepper currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">

          {/* Dynamic Content */}
          <div className="min-h-100">{renderStepContent()}</div>
        </div>
      </div>

      {/* Sticky Footer Navigation */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-1.5"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-600"
                onClick={() =>
                  navigate(`/company/${companyId}/payroll/history`)
                }
              >
                Save & Exit
              </Button>

              <Button
                size="sm"
                onClick={nextStep}
                disabled={currentStep === totalSteps}
                className="bg-indigo-700 hover:bg-indigo-800 text-white gap-1.5"
              >
                {currentStep === totalSteps ? "Finish" : "Continue"}
                {currentStep !== totalSteps && (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
