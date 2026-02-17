// src/components/company/payroll/allowances/AddAllowanceDialog.tsx

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
import { Check, ChevronsUpDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

type Props = {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

type AllowanceType = {
  id: string;
  name: string;
  code: string;
  is_cash: boolean;
  is_taxable: boolean;
  description?: string;
};

type Employee = {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
};

type Department = {
  id: string;
  name: string;
};

type SubDepartment = {
  id: string;
  name: string;
  department_id: string;
};

type JobTitle = {
  id: string;
  title: string;
};

type HousingMetadata = {
  type: "ordinary" | "farm" | "service_director";
  is_employer_owned?: boolean;
  rent_paid_to_employer?: number;
};

type CarMetadata = {
  engine_cc: number;
};

export default function AddAllowanceDialog({
  companyId,
  isOpen,
  onClose,
  onUpdated,
}: Props) {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(false);

  // Form states
  const [allowanceTypeId, setAllowanceTypeId] = useState<string>("");
  const [selectedAllowanceType, setSelectedAllowanceType] =
    useState<AllowanceType | null>(null);
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

  // Metadata states
  const [housingMetadata, setHousingMetadata] = useState<HousingMetadata>({
    type: "ordinary",
    is_employer_owned: false,
    rent_paid_to_employer: 0,
  });
  const [carMetadata, setCarMetadata] = useState<CarMetadata>({
    engine_cc: 0,
  });

  // Data lists
  const [allowanceTypes, setAllowanceTypes] = useState<AllowanceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subDepartments, setSubDepartments] = useState<SubDepartment[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);

  // Popover states
  const [openAllowanceType, setOpenAllowanceType] = useState(false);
  const [openEmployee, setOpenEmployee] = useState(false);
  const [openDepartment, setOpenDepartment] = useState(false);
  const [openSubDepartment, setOpenSubDepartment] = useState(false);
  const [openJobTitle, setOpenJobTitle] = useState(false);

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
    setAllowanceTypeId("");
    setSelectedAllowanceType(null);
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
    setHousingMetadata({
      type: "ordinary",
      is_employer_owned: false,
      rent_paid_to_employer: 0,
    });
    setCarMetadata({ engine_cc: 0 });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${session?.access_token}`,
        };

        // Fetch allowance types
        const typesResponse = await fetch(
          `${API_BASE_URL}/company/${companyId}/allowance-types`,
          { headers }
        );
        const typesData = await typesResponse.json();
        setAllowanceTypes(typesData);

        // Fetch employees
        const employeesResponse = await fetch(
          `${API_BASE_URL}/company/${companyId}/employees`,
          { headers }
        );
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData);

        // Fetch departments
        const deptsResponse = await fetch(
          `${API_BASE_URL}/company/${companyId}/departments`,
          { headers }
        );
        const deptsData = await deptsResponse.json();
        setDepartments(deptsData);

        // Fetch sub-departments
        const subDeptsResponse = await fetch(
          `${API_BASE_URL}/company/${companyId}/sub-departments`,
          { headers }
        );
        const subDeptsData = await subDeptsResponse.json();
        setSubDepartments(subDeptsData);

        // Fetch job titles
        const jobsResponse = await fetch(
          `${API_BASE_URL}/company/${companyId}/job-titles`,
          { headers }
        );
        const jobsData = await jobsResponse.json();
        setJobTitles(jobsData);
      } catch (err) {
        console.error("Failed to fetch data", err);
        toast.error("Failed to load form data");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, companyId, session]);

  const handleAllowanceTypeSelect = (type: AllowanceType) => {
    setAllowanceTypeId(type.id);
    setSelectedAllowanceType(type);
    setOpenAllowanceType(false);
  };

  const getMetadata = () => {
    if (!selectedAllowanceType) return {};

    switch (selectedAllowanceType.code) {
      case "HOUSING":
        return housingMetadata;
      case "CAR":
        return carMetadata;
      default:
        return {};
    }
  };

  const validateForm = () => {
    if (!allowanceTypeId) {
      toast.error("Please select an allowance type");
      return false;
    }
    if (!value) {
      toast.error("Please enter a value");
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

    // Validate housing metadata
    if (selectedAllowanceType?.code === "HOUSING") {
      if (
        housingMetadata.type === "ordinary" &&
        housingMetadata.is_employer_owned === false &&
        (!housingMetadata.rent_paid_to_employer ||
          housingMetadata.rent_paid_to_employer <= 0)
      ) {
        toast.error(
          "Please enter the rent paid to employer for rented housing"
        );
        return false;
      }
    }

    // Validate car metadata
    if (
      selectedAllowanceType?.code === "CAR" &&
      (!carMetadata.engine_cc || carMetadata.engine_cc <= 0)
    ) {
      toast.error("Please enter the car's engine capacity (CC)");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        allowance_type_id: allowanceTypeId,
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
        metadata: getMetadata(),
      };

      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/allowances`,
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
        throw new Error(error.error || "Failed to assign allowance");
      }

      toast.success("Allowance assigned successfully");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to assign allowance");
    } finally {
      setLoading(false);
    }
  };

  const renderAppliesToField = () => {
    switch (appliesTo) {
      case "INDIVIDUAL":
        return (
          <div className="space-y-2">
            <Label>Employee</Label>
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
                        {`${emp.first_name} ${emp.last_name} (${emp.employee_number})`}
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
            <Label>Department</Label>
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
              <PopoverContent className="w-100p-0">
                <Command>
                  <CommandInput placeholder="Search departments..." />
                  <CommandEmpty>No department found.</CommandEmpty>
                  <CommandGroup>
                    {departments.map((dept) => (
                      <CommandItem
                        key={dept.id}
                        onSelect={() => {
                          setDepartmentId(dept.id);
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
          <div className="space-y-2">
            <Label>Sub-department</Label>
            <Popover open={openSubDepartment} onOpenChange={setOpenSubDepartment}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSubDepartment}
                  className="w-full justify-between"
                >
                  {subDepartmentId
                    ? subDepartments.find(
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
                    {subDepartments.map((sub) => (
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
        );

      case "JOB_TITLE":
        return (
          <div className="space-y-2">
            <Label>Job Title</Label>
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

  const renderMetadataFields = () => {
    if (!selectedAllowanceType) return null;

    switch (selectedAllowanceType.code) {
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
                    checked={housingMetadata.is_employer_owned}
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
          <DialogTitle>Assign New Allowance</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Allowance Type */}
          <div className="space-y-2">
            <Label htmlFor="allowance-type">Allowance Type *</Label>
            <Popover open={openAllowanceType} onOpenChange={setOpenAllowanceType}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openAllowanceType}
                  className="w-full justify-between"
                >
                  {selectedAllowanceType?.name || "Select allowance type..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput placeholder="Search allowance types..." />
                  <CommandEmpty>No allowance type found.</CommandEmpty>
                  <CommandGroup>
                    {allowanceTypes.map((type) => (
                      <CommandItem
                        key={type.id}
                        onSelect={() => handleAllowanceTypeSelect(type)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            allowanceTypeId === type.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div>
                          <div>{type.name}</div>
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
            onClick={handleSave}
            disabled={loading}
            className="bg-[#7F5EFD] text-white hover:bg-[#6a4ad3]"
          >
            {loading ? "Assigning..." : "Assign Allowance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}