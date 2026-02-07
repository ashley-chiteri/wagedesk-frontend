import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export function JobTitlesTable() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Job Titles</h3>
        <Button className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Title
        </Button>
      </div>

      <div className="rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Accountant</TableCell>
              <TableCell>Finance</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
