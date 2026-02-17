// src/components/company/payroll/deductions/EditDeductionDialog.tsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { AssignedDeduction } from "./DeductionAssignTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type Props = {
  deduction: AssignedDeduction;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditDeductionDialog({
  deduction,
  companyId,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form states
  const [value, setValue] = useState(deduction.value.toString());
  const [calculationType, setCalculationType] = useState<"FIXED" | "PERCENTAGE">(
    deduction.calculation_type
  );
  const [isRecurring, setIsRecurring] = useState(deduction.is_recurring);
  const [startDate, setStartDate] = useState(deduction.start_date);
  const [numberOfMonths, setNumberOfMonths] = useState(
    deduction.number_of_months?.toString() || ""
  );
  const [endDate, setEndDate] = useState(deduction.end_date || "");

  // Calculate end date when number of months changes
  useEffect(() => {
    if (!isRecurring && startDate && numberOfMonths) {
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + parseInt(numberOfMonths));
      setEndDate(start.toISOString().split("T")[0]);
    }
  }, [isRecurring, startDate, numberOfMonths]);

  const validateForm = () => {
    if (!value) {
      toast.error("Please enter a value");
      return false;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        value: parseFloat(value),
        calculation_type: calculationType,
        is_recurring: isRecurring,
        start_date: startDate,
        number_of_months: !isRecurring && numberOfMonths ? parseInt(numberOfMonths) : null,
        metadata: {},
      };

      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/deductions/${deduction.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update deduction");
      }

      toast.success("Deduction updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update deduction");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get recipient display
  const getRecipientDisplay = () => {
    switch (deduction.applies_to) {
      case "INDIVIDUAL":
        return deduction.employees
          ? `${deduction.employees.first_name} ${deduction.employees.last_name}`
          : "Unknown Employee";
      case "COMPANY":
        return "All Employees";
      case "DEPARTMENT":
        return deduction.departments?.name || "Unknown Department";
      case "SUB_DEPARTMENT":
        return deduction.sub_departments?.name || "Unknown Sub-department";
      case "JOB_TITLE":
        return deduction.job_titles?.title || "Unknown Job Title";
      default:
        return "N/A";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deduction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Deduction Type</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                <span>{deduction.deduction_types.name}</span>
                {deduction.deduction_types.is_pre_tax && (
                  <Badge variant="secondary" className="text-xs">
                    Pre-tax
                  </Badge>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Assigned To</Label>
              <div className="p-2 border rounded-md bg-muted/50">
                {getRecipientDisplay()}
                {deduction.applies_to !== "INDIVIDUAL" && 
                 deduction.applies_to !== "COMPANY" && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {deduction.applies_to.replace("_", " ")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Pre-tax info */}
          {deduction.deduction_types.is_pre_tax && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/20 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-500" />
              <span>
                This is a pre-tax deduction. It will be deducted before tax calculation.
              </span>
            </div>
          )}

          {/* Value and Calculation Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step={calculationType === "PERCENTAGE" ? "0.01" : "1"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={calculationType === "PERCENTAGE" ? "Enter percentage" : "Enter amount"}
              />
            </div>
            <div className="space-y-2">
              <Label>Calculation Type *</Label>
              <RadioGroup
                value={calculationType}
                onValueChange={(val: "FIXED" | "PERCENTAGE") =>
                  setCalculationType(val)
                }
                className="flex h-10 items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="FIXED" id="fixed" />
                  <Label htmlFor="fixed">Fixed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="PERCENTAGE" id="percentage" />
                  <Label htmlFor="percentage">Percentage</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Recurring Switch */}
          <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
            <div>
              <Label htmlFor="is-recurring">Recurring Deduction</Label>
              <p className="text-sm text-muted-foreground">
                {isRecurring
                  ? "This deduction will continue indefinitely"
                  : "This deduction will end after a specified period"}
              </p>
            </div>
            <Switch
              id="is-recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {/* Date Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {!isRecurring && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="months">Number of Months</Label>
                  <Input
                    id="months"
                    type="number"
                    min="1"
                    value={numberOfMonths}
                    onChange={(e) => setNumberOfMonths(e.target.value)}
                    placeholder="Enter number of months"
                  />
                </div>
                {endDate && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This deduction will end on{" "}
                      <span className="font-medium">
                        {new Date(endDate).toLocaleDateString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#7F5EFD] text-white hover:bg-[#6a4ad3]"
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Deduction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}