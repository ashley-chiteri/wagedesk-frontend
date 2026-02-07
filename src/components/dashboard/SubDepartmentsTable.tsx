import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export function SubDepartmentsTable() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Units / Sub-Departments</h3>
        <Button className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell>Payroll</TableCell>
              <TableCell className="font-medium">Finance</TableCell>
              <TableCell className="text-muted-foreground">
                Salary processing unit
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
