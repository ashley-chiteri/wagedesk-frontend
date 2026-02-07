import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Building2,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Layers,
  Settings2,
} from "lucide-react";
import confetti from "canvas-confetti";

import { CompanyProfileForm } from "./CompanyProfileForm";
import { DepartmentsTable } from "./DepartmentsTable";
import { SubDepartmentsTable } from "./SubDepartmentsTable";
import { JobTitlesTable } from "./JobTitlesTable";

export default function CompanySetup() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  // Placeholder state for future logic: Disable navigation if company doesn't exist
  const [isCompanyCreated, setIsCompanyCreated] = useState(false);

  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
    // logic for "save " will go here
    else setDone(true);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/dashboard");
  };

  useEffect(() => {
    if (done) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [done]);

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
        {/* Sidebar Stepper - Sticky */}
        <div className="md:col-span-4 lg:col-span-3 sticky top-12 space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Setup Guide</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Configure your workspace
            </p>
          </div>

          <VerticalStepper step={step} />

          <Button
            variant="ghost"
            onClick={prevStep}
            className="text-muted-foreground hover:text-foreground p-0 h-auto"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {step === 1 ? "Back to Dashboard" : "Previous step"}
          </Button>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-8 lg:col-span-9">
          <Card className="bg-white dark:bg-background border border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pt-10 px-10">
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-50 text-[#1F3A8A] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Step {step}
                </span>
              </div>
              <CardTitle className="text-3xl font-bold">
                {step === 1 && "Company Profile"}
                {step === 2 && "Departments"}
                {step === 3 && "Projects & Units"}
                {step === 4 && "Job Titles"}
              </CardTitle>
              <CardDescription className="text-base">
                {step === 1 &&
                  "Enter your basic business and statutory information."}
                {step === 2 &&
                  "Organize your company into high-level departments."}
                {step === 3 &&
                  "Define specific projects or sub-units within departments."}
                {step === 4 &&
                  "List the roles and job titles used in your organization."}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-10">
              {/* Dynamic Form Content */}
              <div className="min-h-75">
                {step === 1 && <CompanyProfileForm />}
                {step === 2 && <DepartmentsTable />}
                {step === 3 && <SubDepartmentsTable />}
                {step === 4 && <JobTitlesTable />}
              </div>

              {/* Navigation Actions */}
              <div className="mt-12 flex justify-end">
                <Button
                  onClick={nextStep}
                  // Disable if on step > 1 and no company created (Logic to be implemented)
                  disabled={step > 1 && !isCompanyCreated && false}
                  className="bg-[#1F3A8A] hover:bg-[#162a63] px-5 h-12 rounded-lg text-md font-semibold shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5"
                >
                  {step === totalSteps ? "Finish Setup" : "Save & Continue"}
                  {step !== totalSteps && (
                    <ChevronRight className="ml-2 h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Completion Modal */}
      <Dialog open={done} onOpenChange={() => {}}>
        <DialogContent className="text-center p-0 overflow-hidden sm:max-w-md rounded-[2.5rem] border-none shadow-xl">
          <div className="p-12">
            {/* Animated Icon Container */}
            <div className="relative mx-auto mb-10 h-24 w-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-green-100 blur-xl opacity-60" />
              <div className="relative h-20 w-20 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2
                  className="h-11 w-11 text-green-500"
                  strokeWidth={2.25}
                />
              </div>
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-3xl font-bold text-slate-900 tracking-tight">
                Setup complete
              </DialogTitle>
            </DialogHeader>

            <p className="mt-4 text-slate-500 text-base leading-relaxed max-w-sm mx-auto">
              Your workspace has been successfully configured. You can now start
              managing employees and payroll.
            </p>

            <div className="mt-12 space-y-4">
              <Button
                className="w-full bg-[#1F3A8A] hover:bg-[#162a63] h-14 rounded-2xl text-base font-semibold shadow-md transition-all hover:-translate-y-px"
                onClick={() => navigate("/employees")}
              >
                Go to Employee Directory
              </Button>

              <Button
                variant="ghost"
                className="w-full h-12 rounded-xl text-slate-400 hover:text-slate-600 font-medium"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VerticalStepper({ step }: { step: number }) {
  const steps = [
    { title: "Profile", icon: <Building2 size={18} /> },
    { title: "Departments", icon: <Layers size={18} /> },
    { title: "Units", icon: <Settings2 size={18} /> },
    { title: "Titles", icon: <Briefcase size={18} /> },
  ];

  return (
    <nav className="flex flex-col gap-2">
      {steps.map((s, i) => {
        const isActive = step === i + 1;
        const isCompleted = step > i + 1;

        return (
          <div
            key={s.title}
            className="relative flex items-start gap-4 pb-8 last:pb-0"
          >
            {/* Vertical Line Connector */}
            {i !== steps.length - 1 && (
              <div
                className={`absolute left-5 top-10 w-0.5 h-[calc(100%-20px)] transition-colors duration-500
                ${isCompleted ? "bg-green-500" : "bg-slate-200"}`}
              />
            )}

            <div
              className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
              ${
                isCompleted
                  ? "bg-green-500 text-white"
                  : isActive
                    ? "bg-[#1F3A8A] text-white shadow-lg scale-110"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {isCompleted ? <CheckCircle2 size={20} /> : s.icon}
            </div>

            <div className="flex flex-col pt-1">
              <span
                className={`text-sm font-bold transition-colors
                ${isActive ? "text-[#1F3A8A]" : isCompleted ? "text-green-600" : "text-slate-400"}`}
              >
                {s.title}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {isCompleted
                  ? "Completed"
                  : isActive
                    ? "In Progress"
                    : "Pending"}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}
