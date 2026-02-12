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
import { Switch } from "@/components/ui/switch";
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
import {
  BorderFloatingField,
  BorderFloatingSelect,
} from "@/components/company/employees/employeeutils";
// Add cn utility if not already imported
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "@/config";

type AllowanceType = {
  id: string;
  name: string;
  description?: string | null;
  is_cash: boolean;
  is_taxable: boolean;
  has_maximum_value: boolean;
  maximum_value?: number | null;
  code: string;
};

interface Props {
  companyId: string;
}

export function AllowanceTable({ companyId }: Props) {
  const [data, setData] = useState<AllowanceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<AllowanceType | null>(null);
  const [deleteItem, setDeleteItem] = useState<AllowanceType | null>(null);
  const session = useAuthStore.getState().session;

  // Add fetch function similar to deductions table
  const fetchAllowances = useCallback(async () => {
    try {
      setLoading(true);
      const token = session?.access_token;
      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/allowance-types`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const result = await response.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      toast.error("Failed to load allowances");
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  }, [companyId, session?.access_token]);

  useEffect(() => {
    fetchAllowances();
  }, [fetchAllowances]);

  const handleSave = async (values: Omit<AllowanceType, "id">) => {
    const token = session?.access_token;
    const isEditing = !!editingItem;
    const url = isEditing
      ? `${API_BASE_URL}/company/${companyId}/allowance-types/${editingItem.id}`
      : `${API_BASE_URL}/company/${companyId}/allowance-types`;
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
        toast.success(isEditing ? "Allowance updated" : "Allowance created");
        setOpenDialog(false);
        setEditingItem(null);
        fetchAllowances(); // Refresh table
      } else {
        const err = await response.json();
        toast.error(err.error || "Operation failed");
      }
    } catch (error) {
      toast.error("Failed to save allowance");
      console.error("Save error:", error);
    } finally {
      setEditingItem(null);
      setOpenDialog(false);
    }
  };

  const handleDelete = async (id: string) => {
      const token = session?.access_token
  
      try {
        const response = await fetch(
          `${API_BASE_URL}/company/${companyId}/allowance-types/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
  
        if (response.ok) {
          toast.success("Allowance deleted successfully");
          fetchAllowances();
        } else {
          const err = await response.json();
          toast.error(err.error || "Could not allowace deduction");
        }
      } catch (error) {
        toast.error("Failed to delete");
      }
    };

  const columns: ColumnDef<AllowanceType>[] = [
    {
      accessorKey: "name",
      header: "Allowance",
    },
    {
      header: "Type",
      cell: ({ row }) =>
        row.original.is_cash ? (
          <span className="text-slate-700 text-xs font-medium">
            Cash Allowance
          </span>
        ) : (
          <span className="text-slate-500 text-xs font-medium">
            Non-Cash Benefit
          </span>
        ),
    },
    {
      header: "Taxable",
      cell: ({ row }) =>
        row.original.is_taxable ? (
          <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-md">
            Taxable
          </span>
        ) : (
          <span className="text-slate-400 text-xs font-medium bg-slate-50 px-2 py-1 rounded-md">
            Non-Taxable
          </span>
        ),
    },
    {
      header: "Max Limit",
      cell: ({ row }) =>
        row.original.has_maximum_value
          ? `KES ${Number(row.original.maximum_value).toLocaleString()}`
          : "—",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setEditingItem(item);
                setOpenDialog(true);
              }}
              className="hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4 text-slate-500" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteItem(item)}
              className="hover:bg-red-50"
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

  if(loading) {
    <div className="flex flex-col items-center gap-2 text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin text-[#1F3A8A]" />
        <p className="text-sm font-medium">Fetching deductions...</p>
      </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingItem(null);
            setOpenDialog(true);
          }}
          className="bg-[#1F3A8A] hover:bg-[#162a63] rounded-md h-10 px-4 text-sm font-medium transition-all hover:-translate-y-0.5"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Allowance
        </Button>
      </div>

      {/* Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden shadow-none">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="hover:bg-transparent border-b border-slate-200"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs font-medium text-slate-500 uppercase"
                  >
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
                  className="hover:bg-slate-50/50 transition-colors border-b border-slate-100"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
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
                      No allowances configured yet.
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
                      Add your first allowance
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AllowanceDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        initialData={editingItem}
        onSave={handleSave}
      />

      {/* Delete dialog */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent className="rounded-lg border-slate-200 shadow-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg text-slate-900">
              Delete allowance?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-slate-500">
            This action cannot be undone. This will permanently delete the
            allowance.
          </p>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="border-slate-300 hover:bg-slate-50 rounded-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && handleDelete(deleteItem.id)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-md"
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
  initialData: AllowanceType | null;
  onSave: (values: Omit<AllowanceType, "id">) => void;
}

function AllowanceDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: DialogProps) {

  const nonCashOptions = [
    { label: "Car Benefit", value: "CAR" },
    { label: "Meal Benefit", value: "MEAL" },
    { label: "Housing Benefit (Quarters)", value: "HOUSING" },
    { label: "Other", value: "OTHER" },
  ];

  const [isCash, setIsCash] = React.useState(true);
  const [selectedCode, setSelectedCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isTaxable, setIsTaxable] = React.useState(true);
  const [hasMaximum, setHasMaximum] = React.useState(false);
  const [maximumValue, setMaximumValue] = React.useState<number | "">("");

  // Reset or set initial data
  React.useEffect(() => {
    if (initialData) {
      setIsCash(initialData.is_cash);
      setSelectedCode(initialData.code);
      setName(initialData.name);
      setDescription(initialData.description || "");
      setIsTaxable(initialData.is_taxable);
      setHasMaximum(initialData.has_maximum_value);
      setMaximumValue(initialData.maximum_value ?? "");
    } else {
      resetForm();
    }
  }, [initialData, open]);

  const resetForm = () => {
    setIsCash(true);
    setSelectedCode("");
    setName("");
    setDescription("");
    setIsTaxable(true);
    setHasMaximum(false);
    setMaximumValue("");
  };

  // 🔹 Auto rules
  React.useEffect(() => {
    if (isCash) {
      setIsTaxable(true); // Cash always taxable
      setSelectedCode("CASH");
    } else {
      setSelectedCode(""); // Reset selection when switching to non-cash
    }
  }, [isCash]);

  React.useEffect(() => {
    if (!isCash) {
      if (selectedCode === "CAR" || selectedCode === "HOUSING") {
        setIsTaxable(true);
      }
    }
  }, [selectedCode, isCash]);

  const handleSubmit = () => {
    if (!isCash && !selectedCode) return;
    if (!isCash && selectedCode === "OTHER" && !name.trim()) return;
    if (isCash && !name.trim()) return;

    const finalName = isCash
      ? name
      : selectedCode === "OTHER"
        ? name
        : nonCashOptions.find((o) => o.value === selectedCode)?.label || "";

    onSave({
      name: finalName,
      description: description || null,
      is_cash: isCash,
      is_taxable: isTaxable,
      has_maximum_value: hasMaximum,
      maximum_value: hasMaximum ? Number(maximumValue) : null,
      code: isCash ? "CASH" : selectedCode,
    });

    onOpenChange(false);
    resetForm();
  };

  const isLocked =
    !isCash && (selectedCode === "CAR" || selectedCode === "HOUSING");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-lg border-slate-200 p-6 shadow-none">
        <DialogHeader className="pb-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {initialData ? "Edit Allowance" : "Add New Allowance"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Cash/Non-Cash Toggle */}
          <div className="flex gap-3 p-1 bg-slate-50 rounded-md border border-slate-200">
            <Button
              type="button"
              variant={isCash ? "default" : "ghost"}
              onClick={() => setIsCash(true)}
              className={cn(
                "flex-1 h-9 text-sm font-medium rounded-md transition-all",
                isCash
                  ? "bg-white text-slate-900 border border-slate-300 shadow-none hover:bg-white"
                  : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900 border-transparent",
              )}
            >
              Cash Allowance
            </Button>
            <Button
              type="button"
              variant={!isCash ? "default" : "ghost"}
              onClick={() => setIsCash(false)}
              className={cn(
                "flex-1 h-9 text-sm font-medium rounded-md transition-all",
                !isCash
                  ? "bg-white text-slate-900 border border-slate-300 shadow-none hover:bg-white"
                  : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900 border-transparent",
              )}
            >
              Non-Cash Benefit
            </Button>
          </div>

          {/* CASH FLOW */}
          {isCash && (
            <>
              <BorderFloatingField
                label="Allowance Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <BorderFloatingField
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                  Cash allowances are always taxable by KRA regulations.
                </p>
              </div>
            </>
          )}

          {/* NON-CASH FLOW */}
          {!isCash && (
            <>
              <BorderFloatingSelect
                label="Benefit Type"
                options={nonCashOptions}
                value={selectedCode}
                onChange={setSelectedCode}
                required
              />

              {selectedCode === "OTHER" && (
                <BorderFloatingField
                  label="Benefit Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              {selectedCode && selectedCode !== "OTHER" && (
                <BorderFloatingField
                  label="Description (Optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              )}

              {selectedCode === "MEAL" && (
                <div className="bg-amber-50/50 border border-amber-200 rounded-md p-3">
                  <p className="text-xs text-amber-700 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    First KES 5,000 is tax-exempt. Excess will be taxed at
                    applicable rates.
                  </p>
                </div>
              )}

              {selectedCode === "CAR" && (
                <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3">
                  <p className="text-xs text-blue-700 flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    Car benefit is taxable based on KRA prescribed rates.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Taxable Toggle */}
          <div
            className={cn(
              "flex items-center justify-between border rounded-md p-3 bg-white",
              isCash || isLocked ? "border-slate-200" : "border-slate-200",
            )}
          >
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-slate-700">
                Taxable
              </Label>
              <p className="text-xs text-slate-500">
                {isCash || isLocked
                  ? "Locked based on allowance type"
                  : "Toggle if this benefit is taxable"}
              </p>
            </div>
            <Switch
              checked={isTaxable}
              onCheckedChange={setIsTaxable}
              disabled={isCash || isLocked}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Maximum Limit */}
          <div className="flex items-center justify-between border border-slate-200 rounded-md p-3 bg-white">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium text-slate-700">
                Has Maximum Limit
              </Label>
              <p className="text-xs text-slate-500">
                Apply monthly allowance cap
              </p>
            </div>
            <Switch
              checked={hasMaximum}
              onCheckedChange={setHasMaximum}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {/* Maximum Value */}
          {hasMaximum && (
            <BorderFloatingField
              label="Maximum Monthly Amount (KES)"
              type="number"
              value={maximumValue}
              onChange={(e) =>
                setMaximumValue(e.target.value ? Number(e.target.value) : "")
              }
              required
            />
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-slate-100 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mr-3 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md h-10 px-4"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-[#1F3A8A] hover:bg-[#162a63] px-6 rounded-md h-10 text-sm font-medium shadow-none"
            >
              {initialData ? "Update" : "Save"} Allowance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
