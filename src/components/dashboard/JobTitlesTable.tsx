import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2, Inbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

interface JobTitle {
  id: string;
  title: string;
}

export function JobTitlesTable({ companyId }: { companyId: string }) {
 const [titles, setTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const token = useAuthStore.getState().session?.access_token;

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/company/${companyId}/job-titles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitles(res.data);
    } finally { setLoading(false); }
  }, [companyId, token]);

  const handleAdd = async () => {
    try {
      await axios.post(`${API_BASE_URL}/company/job-titles`, 
        { company_id: companyId, title: newTitle },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      setNewTitle("");
      setIsAddOpen(false);
      fetchTitles();
      toast.success("Job title added");
    } catch (err) { toast.error("Failed to add title"); }
  };

 useEffect(() => { 
    if (companyId) fetchTitles(); 
  }, [companyId, fetchTitles]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Job Titles</h3>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className='bg-[#1F3A8A]'><Plus className="h-4 w-4 mr-2" /> Add Title</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Job Title</DialogTitle></DialogHeader>
            <div className="py-4">
              <Input placeholder="e.g. Senior Accountant" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <DialogFooter>
              <Button className="bg-[#1F3A8A] w-full" onClick={handleAdd}>Save Title</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border px-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={2} className="text-center py-6"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow>
            ) : titles.length === 0 ? (
              <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground"><Inbox className="mx-auto mb-2 opacity-20"/>No titles added</TableCell></TableRow>
            ) : (
              titles.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 size={16}/></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}