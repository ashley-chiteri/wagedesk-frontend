// src/components/company/payroll/allowances/EditAllowanceDialog.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { Allowance } from "./AllowanceAssignTable";
import { toast } from "sonner";

type Props = {
  allowance: Allowance;
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

type HousingMetadata = {
  type: "ordinary" | "farm" | "service_director";
  is_employer_owned?: boolean;
  rent_paid_to_employer?: number;
};

type CarMetadata = {
  engine_cc: number;
};

export default function EditAllowanceDialog({
  allowance,
  companyId,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form states
  const [value, setValue] = useState(allowance.value.toString());
  const [calculationType, setCalculationType] = useState<"FIXED" | "PERCENTAGE">(
    allowance.calculation_type
  );
  const [isRecurring, setIsRecurring] = useState(allowance.is_recurring);
  const [startDate, setStartDate] = useState(allowance.start_date);
  const [numberOfMonths, setNumberOfMonths] = useState(
    allowance.number_of_months?.toString() || ""
  );
  const [endDate, setEndDate] = useState(allowance.end_date || "");

  // Metadata states
 const [housingMetadata, setHousingMetadata] = useState<HousingMetadata>(() => {
  if (allowance.allowance_types?.code === "HOUSING") {
    // Type guard to check if metadata has HousingMetadata shape
    const metadata = allowance.metadata;
    if (metadata && 'type' in metadata) {
      return metadata as HousingMetadata;
    }
  }
  return { type: "ordinary" };
});
 const [carMetadata, setCarMetadata] = useState<CarMetadata>(() => {
  if (allowance.allowance_types?.code === "CAR") {
    // Type guard to check if metadata has CarMetadata shape
    const metadata = allowance.metadata;
    if (metadata && 'engine_cc' in metadata) {
      return metadata as CarMetadata;
    }
  }
  return { engine_cc: 0 };
});

  // Calculate end date when number of months changes
  useEffect(() => {
    if (!isRecurring && startDate && numberOfMonths) {
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + parseInt(numberOfMonths));
      setEndDate(start.toISOString().split("T")[0]);
    }
  }, [isRecurring, startDate, numberOfMonths]);

  const getMetadata = () => {
    if (!allowance.allowance_types) return {};

    switch (allowance.allowance_types.code) {
      case "HOUSING":
        return housingMetadata;
      case "CAR":
        return carMetadata;
      default:
        return {};
    }
  };

  const validateForm = () => {
    if (!value) {
      toast.error("Please enter a value");
      return false;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return false;
    }

    // Validate housing metadata
    if (allowance.allowance_types?.code === "HOUSING") {
      if (
        housingMetadata.type === "ordinary" &&
        housingMetadata.is_employer_owned === false &&
        (!housingMetadata.rent_paid_to_employer ||
          housingMetadata.rent_paid_to_employer <= 0)
      ) {
        toast.error("Please enter the rent paid to employer for rented housing");
        return false;
      }
    }

    // Validate car metadata
    if (
      allowance.allowance_types?.code === "CAR" &&
      (!carMetadata.engine_cc || carMetadata.engine_cc <= 0)
    ) {
      toast.error("Please enter the car's engine capacity (CC)");
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
        metadata: getMetadata(),
      };

      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/allowances/${allowance.id}`,
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
        throw new Error(error.error || "Failed to update allowance");
      }

      toast.success("Allowance updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update allowance");
    } finally {
      setLoading(false);
    }
  };

  const renderMetadataFields = () => {
    if (!allowance.allowance_types) return null;

    switch (allowance.allowance_types.code) {
      case "HOUSING":
        return (
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-md font-semibold">Housing Details</h3>
            
            <div className="space-y-2">
              <Label>Housing Type</Label>
              <Select
                value={housingMetadata.type}
                onValueChange={(value: "ordinary" | "farm" | "service_director") =>
                  setHousingMetadata({ ...housingMetadata, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordinary">Ordinary</SelectItem>
                  <SelectItem value="farm">Farm</SelectItem>
                  <SelectItem value="service_director">Service Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {housingMetadata.type === "ordinary" && (
              <>
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="employer-owned">Is Employer Owned?</Label>
                  <Switch
                    id="employer-owned"
                    checked={housingMetadata.is_employer_owned || false}
                    onCheckedChange={(checked) =>
                      setHousingMetadata({
                        ...housingMetadata,
                        is_employer_owned: checked,
                        rent_paid_to_employer: checked ? 0 : housingMetadata.rent_paid_to_employer,
                      })
                    }
                  />
                </div>

                {!housingMetadata.is_employer_owned && (
                  <div className="space-y-2">
                    <Label htmlFor="rent-paid">Rent Paid to Employer (per month)</Label>
                    <Input
                      id="rent-paid"
                      type="number"
                      min="0"
                      step="0.01"
                      value={housingMetadata.rent_paid_to_employer || ""}
                      onChange={(e) =>
                        setHousingMetadata({
                          ...housingMetadata,
                          rent_paid_to_employer: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-muted-foreground">
                      This amount will be deducted from the housing benefit
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "CAR":
        return (
          <div className="space-y-4 rounded-md border p-4">
            <h3 className="text-md font-semibold">Car Details</h3>
            <div className="space-y-2">
              <Label htmlFor="engine-cc">Engine Capacity (CC)</Label>
              <Input
                id="engine-cc"
                type="number"
                min="0"
                step="100"
                value={carMetadata.engine_cc || ""}
                onChange={(e) =>
                  setCarMetadata({
                    engine_cc: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="e.g., 1500"
              />
              <p className="text-xs text-muted-foreground">
                Used for calculating car benefit value
              </p>
            </div>
          </div>
        );

      case "MEAL":
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Note: Meal benefits over 5,000 KES per month are taxable
            </AlertDescription>
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Allowance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Allowance Type</Label>
              <Input 
                disabled 
                value={allowance.allowance_types?.name || "N/A"} 
              />
            </div>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Input 
                disabled 
                value={
                  allowance.applies_to === "INDIVIDUAL"
                    ? allowance.employees
                      ? `${allowance.employees.first_name} ${allowance.employees.last_name}`
                      : "Unknown Employee"
                    : allowance.applies_to === "COMPANY"
                    ? "All Employees"
                    : allowance.applies_to === "DEPARTMENT"
                    ? allowance.departments?.name || "Unknown Department"
                    : allowance.applies_to === "SUB_DEPARTMENT"
                    ? allowance.sub_departments?.name || "Unknown Sub-department"
                    : allowance.job_titles?.title || "Unknown Job Title"
                }
              />
            </div>
          </div>

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
              <Label htmlFor="is-recurring">Recurring Allowance</Label>
              <p className="text-sm text-muted-foreground">
                {isRecurring
                  ? "This allowance will continue indefinitely"
                  : "This allowance will end after a specified period"}
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
                  <div className="rounded-md bg-muted p-3">
                    <p className="text-sm">
                      <span className="font-medium">End Date:</span>{" "}
                      {new Date(endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Metadata Fields */}
          {renderMetadataFields()}
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
            {loading ? "Updating..." : "Update Allowance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}