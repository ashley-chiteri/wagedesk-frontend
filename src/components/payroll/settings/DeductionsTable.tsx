import React, { useState, useEffect, useCallback } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
// Add at top with other imports
import {
  BorderFloatingField,
  BorderFloatingSelect,
} from "@/components/company/employees/employeeutils";

type DeductionType = {
  id: string;
  name: string;
  description?: string | null;
  is_pre_tax: boolean;
  has_maximum_value: boolean;
  maximum_value?: number | null;
  code: string;
};

interface Props {
  companyId: string;
}

export function OtherDeductionsTable({ companyId }: Props) {
  const [data, setData] = useState<DeductionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DeductionType | null>(null);
  const [deleteItem, setDeleteItem] = React.useState<DeductionType | null>(
    null,
  );
  const session = useAuthStore.getState().session;

  // 1. Fetch Data on Mount
  const fetchDeductions = useCallback(async () => {
    try {
      setLoading(true);
      const token = session?.access_token;
      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/deduction-types`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error("Failed to load deductions");
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, session?.access_token]);

  useEffect(() => {
    fetchDeductions();
  }, [fetchDeductions]);

  // 2. Handle Save (Create or Update)
  const handleSave = async (values: Omit<DeductionType, "id">) => {
    const token = session?.access_token;
    const isEditing = !!editingItem;
    const url = isEditing
      ? `${API_BASE_URL}/company/${companyId}/deduction-types/${editingItem.id}`
      : `${API_BASE_URL}/company/${companyId}/deduction-types`;
    try {
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(isEditing ? "Deduction updated" : "Deduction created");
        setOpenDialog(false);
        setEditingItem(null);
        fetchDeductions(); // Refresh table
      } else {
        const err = await response.json();
        toast.error(err.error || "Operation failed");
      }
    } catch (error) {
      toast.error("A network error occurred");
      console.error("Save error:", error);
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id: string) => {
    const token = session?.access_token

    try {
      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/deduction-types/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        toast.success("Deduction deleted successfully");
        fetchDeductions();
      } else {
        const err = await response.json();
        toast.error(err.error || "Could not delete deduction");
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const columns: ColumnDef<DeductionType>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "code",
      header: "Code",
    },
    {
      accessorKey: "is_pre_tax",
      header: "Pre-Tax",
      cell: ({ row }) => (row.original.is_pre_tax ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingItem(item);
                setOpenDialog(true);
              }}
            >
              <Pencil className="h-4 w-4 text-slate-500" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteItem(item)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#1F3A8A]" />
        <p className="text-sm font-medium">Fetching deductions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + Add Button */}
      <div className="flex justify-end items-center">
        <Button
          onClick={() => {
            setEditingItem(null);
            setOpenDialog(true);
          }}
          className="bg-[#1F3A8A] hover:bg-[#162a63] h-10 rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Deduction
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-slate-400"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm">
                      No Deductions configured yet.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingItem(null);
                        setOpenDialog(true);
                      }}
                      className="mt-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Add your first Deduction
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <DeductionDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        initialData={editingItem}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete deduction?</AlertDialogTitle>
          </AlertDialogHeader>

          <p className="text-sm text-slate-500">
            This action cannot be undone.
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
        onClick={() => deleteItem && handleDelete(deleteItem.id)}
        className="bg-red-600 hover:bg-red-700"
      >
        Delete
      </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: DeductionType | null;
  onSave: (values: Omit<DeductionType, "id">) => void;
}

// In your DeductionDialog component, replace the floating components with these:

function DeductionDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: DialogProps) {
  const deductionOptions = [
    { label: "Mortgage Interest", value: "MORTGAGE_INTEREST" },
    { label: "Post Retirement Medical Fund (PRMF)", value: "PRMF" },
    { label: "Other", value: "OTHER" },
  ];

  const [selectedCode, setSelectedCode] = React.useState<string>("");
  const [customName, setCustomName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isPreTax, setIsPreTax] = React.useState(false);
  const [hasMaximum, setHasMaximum] = React.useState(false);
  const [maximumValue, setMaximumValue] = React.useState<number | "">("");

  React.useEffect(() => {
    if (initialData) {
      setSelectedCode(initialData.code);
      setCustomName(initialData.code === "OTHER" ? initialData.name : "");
      setDescription(initialData.description || "");
      setIsPreTax(initialData.is_pre_tax);
      setHasMaximum(initialData.has_maximum_value);
      setMaximumValue(initialData.maximum_value ?? "");
    } else {
      resetForm();
    }
  }, [initialData]);

  const resetForm = () => {
    setSelectedCode("");
    setCustomName("");
    setDescription("");
    setIsPreTax(false);
    setHasMaximum(false);
    setMaximumValue("");
  };

  // 🔹 Auto business rules
  React.useEffect(() => {
    if (selectedCode === "MORTGAGE_INTEREST") {
      setIsPreTax(true);
      setHasMaximum(true);
      setMaximumValue(30000);
    } else if (selectedCode === "PRMF") {
      setIsPreTax(true);
      setHasMaximum(true);
      setMaximumValue(15000);
    } else if (selectedCode === "OTHER") {
      setIsPreTax(false);
      setHasMaximum(false);
      setMaximumValue("");
    }
  }, [selectedCode]);

  const handleSubmit = () => {
    if (!selectedCode) {
    toast.error("Please select a deduction type");
    return;
  }

  if (selectedCode === "OTHER" && !customName.trim()) {
    toast.error("Please enter a deduction name");
    return;
  }

  if (hasMaximum && (!maximumValue || Number(maximumValue) <= 0)) {
    toast.error("Please enter a valid maximum amount");
    return;
  }

    const name =
      selectedCode === "OTHER"
        ? customName.trim()
        : deductionOptions.find((o) => o.value === selectedCode)?.label || "";

    onSave({
      name,
       description: description || null,
      is_pre_tax: isPreTax,
      has_maximum_value: hasMaximum,
      maximum_value: hasMaximum ? Number(maximumValue) : null,
      code: selectedCode,
    });

    onOpenChange(false);
    resetForm();
  };

  const isLocked =
    selectedCode === "MORTGAGE_INTEREST" || selectedCode === "PRMF";

  return (
   <Dialog open={open} onOpenChange={(isOpen) => {
  onOpenChange(isOpen);
  if (!isOpen) resetForm();
}}>
      <DialogContent className="sm:max-w-lg rounded-lg border-slate-200 p-6">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {initialData ? "Edit Deduction Type" : "Add Deduction Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Deduction Type Selector - BORDER FLOATING SELECT */}
          <BorderFloatingSelect
            label="Deduction Type"
            options={deductionOptions}
            value={selectedCode}
            onChange={(v) => setSelectedCode(v)}
            required
          />

          {/* Custom Name (Only for OTHER) */}
          {selectedCode === "OTHER" && (
            <BorderFloatingField
              label="Deduction Name"
              required
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
          )}

          {/* Description */}
          <BorderFloatingField
            label="Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Pre Tax Toggle */}
          <div className="flex items-center justify-between border border-slate-200 rounded-md p-3 bg-white">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-slate-700">
                Pre-Tax Deduction
              </Label>
              <p className="text-xs text-slate-500">
                Deducted before PAYE calculation
              </p>
            </div>
            <Switch
              checked={isPreTax}
              onCheckedChange={setIsPreTax}
              disabled={isLocked}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Maximum Toggle */}
          <div className="flex items-center justify-between border border-slate-200 rounded-md p-3 bg-white">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-slate-700">
                Has Maximum Limit
              </Label>
              <p className="text-xs text-slate-500">
                Apply monthly deduction cap
              </p>
            </div>
            <Switch
              checked={hasMaximum}
              onCheckedChange={setHasMaximum}
              disabled={isLocked}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Maximum Value */}
          {hasMaximum && (
            <BorderFloatingField
              label="Maximum Monthly Amount"
              type="number"
              value={maximumValue}
              onChange={(e) =>
                setMaximumValue(e.target.value ? Number(e.target.value) : "")
              }
              disabled={isLocked}
            />
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <Button
              onClick={handleSubmit}
              className="bg-[#1F3A8A] hover:bg-[#162a63] px-6 rounded-md h-10 text-sm font-medium"
            >
              {initialData ? "Update" : "Save"} Deduction
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
