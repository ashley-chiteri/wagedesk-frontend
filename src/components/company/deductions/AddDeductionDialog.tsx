// src/components/company/payroll/deductions/AddDeductionDialog.tsx

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Props = {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
  employees: Employee[];
  deductionTypes: DeductionType[];
  departments: Department[];
  subDepartments?: SubDepartment[];
  jobTitles?: JobTitle[];
};

export type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
};

export type Department = {
  id: string;
  name: string;
};

export type SubDepartment = {
  id: string;
  name: string;
  department_id: string;
};

export type JobTitle = {
  id: string;
  title: string;
};

export type DeductionType = {
  id: string;
  name: string;
  code: string;
  is_pre_tax: boolean;
  description?: string;
  has_maximum_value?: boolean;
  maximum_value?: number;
};

export default function AddDeductionDialog({
  companyId,
  isOpen,
  onClose,
  onUpdated,
  employees,
  deductionTypes,
  departments,
  subDepartments = [],
  jobTitles = [],
}: Props) {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form states
  const [deductionTypeId, setDeductionTypeId] = useState<string>("");
  const [selectedDeductionType, setSelectedDeductionType] =
    useState<DeductionType | null>(null);
  const [appliesTo, setAppliesTo] = useState<string>("INDIVIDUAL");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [subDepartmentId, setSubDepartmentId] = useState<string>("");
  const [jobTitleId, setJobTitleId] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [calculationType, setCalculationType] = useState<"FIXED" | "PERCENTAGE">("FIXED");
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [numberOfMonths, setNumberOfMonths] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Popover states
  const [openDeductionType, setOpenDeductionType] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openSubDepartment, setOpenSubDepartment] = useState(false);
  const [openJobTitle, setOpenJobTitle] = useState(false);

  // Filtered sub-departments based on selected department
  const filteredSubDepartments = subDepartments.filter(
    (sub) => sub.department_id === departmentId
  );

  // Calculate end date when number of months changes
  useEffect(() => {
    if (!isRecurring && startDate && numberOfMonths) {
      const start = new Date(startDate);
      start.setMonth(start.getMonth() + parseInt(numberOfMonths));
      setEndDate(start.toISOString().split("T")[0]);
    } else {
      setEndDate("");
    }
  }, [isRecurring, startDate, numberOfMonths]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setDeductionTypeId("");
    setSelectedDeductionType(null);
    setAppliesTo("INDIVIDUAL");
    setEmployeeId("");
    setDepartmentId("");
    setSubDepartmentId("");
    setJobTitleId("");
    setValue("");
    setCalculationType("FIXED");
    setIsRecurring(true);
    setStartDate(new Date().toISOString().split("T")[0]);
    setNumberOfMonths("");
    setEndDate("");
  };

  const handleDeductionTypeSelect = (type: DeductionType) => {
    setDeductionTypeId(type.id);
    setSelectedDeductionType(type);
    setOpenDeductionType(false);
  };

  const validateForm = () => {
    if (!deductionTypeId) {
      toast.error("Please select a deduction type");
      return false;
    }
    if (!value) {
      toast.error("Please enter a value");
      return false;
    }

    // Validate based on deduction type maximum value
    if (selectedDeductionType?.has_maximum_value && 
        selectedDeductionType.maximum_value && 
        parseFloat(value) > selectedDeductionType.maximum_value) {
      toast.error(`Value cannot exceed ${selectedDeductionType.maximum_value}`);
      return false;
    }

    if (!startDate) {
      toast.error("Please select a start date");
      return false;
    }

    // Validate appliesTo selections
    switch (appliesTo) {
      case "INDIVIDUAL":
        if (!employeeId) {
          toast.error("Please select an employee");
          return false;
        }
        break;
      case "DEPARTMENT":
        if (!departmentId) {
          toast.error("Please select a department");
          return false;
        }
        break;
      case "SUB_DEPARTMENT":
        if (!subDepartmentId) {
          toast.error("Please select a sub-department");
          return false;
        }
        break;
      case "JOB_TITLE":
        if (!jobTitleId) {
          toast.error("Please select a job title");
          return false;
        }
        break;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        deduction_type_id: deductionTypeId,
        applies_to: appliesTo,
        employee_id: appliesTo === "INDIVIDUAL" ? employeeId : null,
        department_id: appliesTo === "DEPARTMENT" ? departmentId : null,
        sub_department_id: appliesTo === "SUB_DEPARTMENT" ? subDepartmentId : null,
        job_title_id: appliesTo === "JOB_TITLE" ? jobTitleId : null,
        value: parseFloat(value),
        calculation_type: calculationType,
        is_recurring: isRecurring,
        start_date: startDate,
        number_of_months: !isRecurring && numberOfMonths ? parseInt(numberOfMonths) : null,
        metadata: {},
      };

      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/deductions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign deduction");
      }

      toast.success("Deduction assigned successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to assign deduction");
    } finally {
      setLoading(false);
    }
  };

  const renderAppliesToField = () => {
    switch (appliesTo) {
      case "INDIVIDUAL":
        return (
          <div className="space-y-2">
            <Label>Employee *</Label>
            <Popover open={openEmployee} onOpenChange={setOpenEmployee}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openEmployee}
                  className="w-full justify-between"
                >
                  {employeeId
                    ? employees.find((emp) => emp.id === employeeId)
                        ?.first_name +
                      " " +
                      employees.find((emp) => emp.id === employeeId)?.last_name
                    : "Select employee..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput placeholder="Search employees..." />
                  <CommandEmpty>No employee found.</CommandEmpty>
                  <CommandGroup>
                    {employees.map((emp) => (
                      <CommandItem
                        key={emp.id}
                        onSelect={() => {
                          setEmployeeId(emp.id);
                          setOpenEmployee(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            employeeId === emp.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div>
                          <div>{`${emp.first_name} ${emp.last_name}`}</div>
                          <div className="text-xs text-muted-foreground">
                            {emp.employee_number}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "DEPARTMENT":
        return (
          <div className="space-y-2">
            <Label>Department *</Label>
            <Popover open={openDepartment} onOpenChange={setOpenDepartment}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDepartment}
                  className="w-full justify-between"
                >
                  {departmentId
                    ? departments.find((dept) => dept.id === departmentId)?.name
                    : "Select department..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput placeholder="Search departments..." />
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    {departments.map((dept) => (
                      <CommandItem
                        key={dept.id}
                        onSelect={() => {
                          setDepartmentId(dept.id);
                          setSubDepartmentId(""); // Reset sub-department when department changes
                          setOpenDepartment(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            departmentId === dept.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {dept.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      case "SUB_DEPARTMENT":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={departmentId}
                onValueChange={(value) => {
                  setDepartmentId(value);
                  setSubDepartmentId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department first" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {departmentId && (
              <div className="space-y-2">
                <Label>Sub-department *</Label>
                <Popover open={openSubDepartment} onOpenChange={setOpenSubDepartment}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openSubDepartment}
                      className="w-full justify-between"
                    >
                      {subDepartmentId
                        ? filteredSubDepartments.find(
                            (sub) => sub.id === subDepartmentId
                          )?.name
                        : "Select sub-department..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-100 p-0">
                    <Command>
                      <CommandInput placeholder="Search sub-departments..." />
                      <CommandEmpty>No sub-department found.</CommandEmpty>
                      <CommandGroup>
                        {filteredSubDepartments.map((sub) => (
                          <CommandItem
                            key={sub.id}
                            onSelect={() => {
                              setSubDepartmentId(sub.id);
                              setOpenSubDepartment(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                subDepartmentId === sub.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {sub.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        );

      case "JOB_TITLE":
        return (
          <div className="space-y-2">
            <Label>Job Title *</Label>
            <Popover open={openJobTitle} onOpenChange={setOpenJobTitle}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openJobTitle}
                  className="w-full justify-between"
                >
                  {jobTitleId
                    ? jobTitles.find((job) => job.id === jobTitleId)?.title
                    : "Select job title..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput placeholder="Search job titles..." />
                  <CommandEmpty>No job title found.</CommandEmpty>
                  <CommandGroup>
                    {jobTitles.map((job) => (
                      <CommandItem
                        key={job.id}
                        onSelect={() => {
                          setJobTitleId(job.id);
                          setOpenJobTitle(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            jobTitleId === job.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {job.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign New Deduction</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Deduction Type */}
          <div className="space-y-2">
            <Label htmlFor="deduction-type">Deduction Type *</Label>
            <Popover open={openDeductionType} onOpenChange={setOpenDeductionType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDeductionType}
                  className="w-full justify-between"
                >
                  {selectedDeductionType?.name || "Select deduction type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput placeholder="Search deduction types..." />
                  <CommandEmpty>No deduction type found.</CommandEmpty>
                  <CommandGroup>
                    {deductionTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        onSelect={() => handleDeductionTypeSelect(type)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            deductionTypeId === type.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>{type.name}</span>
                            {type.is_pre_tax && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Pre-tax
                              </Badge>
                            )}
                          </div>
                          {type.description && (
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {/* Deduction type info */}
            {selectedDeductionType && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Info className="h-4 w-4" />
                <span>
                  {selectedDeductionType.is_pre_tax 
                    ? "This is a pre-tax deduction (deducted before tax calculation)"
                    : "This is a post-tax deduction (deducted after tax calculation)"}
                </span>
              </div>
            )}
          </div>

          {/* Applies To */}
          <div className="space-y-2">
            <Label>Applies To *</Label>
            <Select value={appliesTo} onValueChange={setAppliesTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select who this applies to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual Employee</SelectItem>
                <SelectItem value="COMPANY">All Employees (Company)</SelectItem>
                <SelectItem value="DEPARTMENT">Department</SelectItem>
                <SelectItem value="SUB_DEPARTMENT">Sub-department</SelectItem>
                <SelectItem value="JOB_TITLE">Job Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional field based on appliesTo */}
          {appliesTo !== "COMPANY" && renderAppliesToField()}

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
              {selectedDeductionType?.has_maximum_value && selectedDeductionType.maximum_value && (
                <p className="text-xs text-muted-foreground">
                  Maximum value: {selectedDeductionType.maximum_value}
                  {calculationType === "PERCENTAGE" ? "%" : ""}
                </p>
              )}
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
            onClick={handleSave}
            disabled={loading}
            className="bg-[#7F5EFD] text-white hover:bg-[#6a4ad3]"
          >
            {loading ? "Assigning..." : "Assign Deduction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}