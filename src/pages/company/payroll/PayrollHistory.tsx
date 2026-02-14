// src/pages/company/payroll/PayrollHistory.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  MoreVertical,
  Eye,
  Download,
  CheckCircle,
  FileText,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { API_BASE_URL } from "@/config";
import { toast } from "sonner";

// Types
type PayrollStatus = "DRAFT" | "UNDER_REVIEW" | "APPROVED" | "PAID";

interface PayrollRun {
  id: string;
  payroll_number: string;
  payroll_month: string;
  payroll_year: number;
  total_gross_pay: number;
  total_net_pay: number;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

interface PayrollFilters {
  status: PayrollStatus | "all";
  year: number | "all";
  search: string;
}

// Constants
const PAGE_SIZE = 10;

const STATUS_OPTIONS: { value: PayrollStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "PAID", label: "Paid" },
];

// Utility functions
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const getStatusBadgeVariant = (status: PayrollStatus) => {
  const variants: Record<PayrollStatus, "default" | "secondary" | "outline" | "destructive"> = {
    DRAFT: "secondary",
    UNDER_REVIEW: "outline",
    APPROVED: "default",
    PAID: "default",
  };
  return variants[status] || "secondary";
};

// Components
const EmptyState = () => (
  <TableRow>
    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
      <div className="flex flex-col items-center justify-center gap-2">
        <FileText className="h-8 w-8 text-slate-400" />
        <p>No payroll history found.</p>
        <p className="text-sm">Try adjusting your filters or create a new payroll run.</p>
      </div>
    </TableCell>
  </TableRow>
);

const LoadingState = () => (
  <TableRow>
    <TableCell colSpan={6}>
      <div className="space-y-3 p-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
      </div>
    </TableCell>
  </TableRow>
);

export default function PayrollHistory() {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();
  const session = useAuthStore((state) => state.session);
  const token = session?.access_token;

  // State
  const [payrolls, setPayrolls] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PayrollFilters>({
    status: "all",
    year: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
  });

  // Memoized values
  const availableYears = useMemo(() => {
    const years = payrolls.map((p) => p.payroll_year);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [payrolls]);

  // API calls
  const fetchPayrolls = useCallback(async () => {
    if (!companyId || !token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: PAGE_SIZE.toString(),
        ...(filters.status !== "all" && { status: filters.status }),
        ...(filters.year !== "all" && { year: filters.year.toString() }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/payroll/runs?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming API returns { data: PayrollRun[], totalPages: number, totalItems: number }
      setPayrolls(Array.isArray(data) ? data : data.data || []);
      setPagination(prev => ({
        ...prev,
        totalPages: data.totalPages || 1,
        totalItems: data.totalItems || (Array.isArray(data) ? data.length : 0),
      }));
    } catch (error) {
      console.error("Failed to fetch payrolls:", error);
      toast.error("Failed to load payroll history. Please try again.");
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, token, pagination.currentPage, filters]);

  useEffect(() => {
    fetchPayrolls();
  }, [fetchPayrolls]);

  const handleStatusUpdate = async (runId: string, newStatus: PayrollStatus) => {
    if (!companyId || !token) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/company/${companyId}/payroll/${runId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Update failed");
      }

      toast.success(`Payroll status updated to ${newStatus.toLowerCase()}`);
      fetchPayrolls();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update payroll status. Please try again.");
    }
  };

  // Event handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleStatusFilter = (value: PayrollStatus | "all") => {
    setFilters(prev => ({ ...prev, status: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleYearFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      year: value === "all" ? "all" : parseInt(value, 10) 
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const handleRowClick = (payrollId: string) => {
    navigate(`/company/${companyId}/payroll/${payrollId}/review-status`);
  };

  const handleViewDetails = (e: React.MouseEvent, payrollId: string) => {
    e.stopPropagation();
    navigate(`/company/${companyId}/payroll/${payrollId}/review-status`);
  };

  const handleStatusAction = (e: React.MouseEvent, runId: string, newStatus: PayrollStatus) => {
    e.stopPropagation();
    handleStatusUpdate(runId, newStatus);
  };

  const handleRunNewPayroll = () => {
    navigate(`/company/${companyId}/payroll/run`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Payroll History</h1>
        <Button onClick={handleRunNewPayroll} className="w-full sm:w-auto">
          Run New Payroll
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-slate-200 rounded-md shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by payroll number or period..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className=" pl-9 h-10 bg-white border-slate-300 shadow-none focus-visible:ring-1 focus-visible:ring-blue-500"
                aria-label="Search payrolls"
              />
            </div>
            
            <div className="flex gap-2 ">
              <Select value={filters.status} onValueChange={handleStatusFilter}>
                <SelectTrigger className="w-40 shadow-none border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent >
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {availableYears.length > 0 && (
                <Select 
                  value={filters.year.toString()} 
                  onValueChange={handleYearFilter}
                >
                  <SelectTrigger className="w-35 shadow-none border-slate-300 focus-visible:ring-1 focus-visible:ring-blue-500  ">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="overflow-hidden shadow-none rounded-md px-2  border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="py-4">
              <TableRow>
                <TableHead className="w-45">Period</TableHead>
                <TableHead className="w-37.5">Payroll #</TableHead>
                <TableHead className="text-right w-37.5">Gross Pay</TableHead>
                <TableHead className="text-right w-37.5">Net Pay</TableHead>
                <TableHead className="w-30">Status</TableHead>
                <TableHead className="text-center w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <LoadingState />
              ) : payrolls.length > 0 ? (
                payrolls.map((run) => (
                  <TableRow
                    key={run.id}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors group"
                    onClick={() => handleRowClick(run.id)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{run.payroll_month} {run.payroll_year}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(run.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded-md">
                        {run.payroll_number}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(run.total_gross_pay)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatCurrency(run.total_net_pay)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(run.status)}>
                        {run.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell 
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 opacity-70 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={(e) => handleViewDetails(e, run.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> 
                            View Details
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {run.status === "DRAFT" && (
                            <DropdownMenuItem
                              onClick={(e) => handleStatusAction(e, run.id, "UNDER_REVIEW")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-blue-600" /> 
                              Submit for Review
                            </DropdownMenuItem>
                          )}
                          
                          {run.status === "UNDER_REVIEW" && (
                            <DropdownMenuItem
                              onClick={(e) => handleStatusAction(e, run.id, "APPROVED")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> 
                              Approve Payroll
                            </DropdownMenuItem>
                          )}
                          
                          {run.status === "APPROVED" && (
                            <DropdownMenuItem
                              onClick={(e) => handleStatusAction(e, run.id, "PAID")}
                            >
                              <DollarSign className="mr-2 h-4 w-4 text-green-600" /> 
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          
                          {run.status === "PAID" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle download payslips
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" /> 
                              Download Payslips
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <EmptyState />
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 0 && (
          <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4  border-t">
            <p className="text-sm text-slate-500 order-2 sm:order-1">
              Showing {((pagination.currentPage - 1) * PAGE_SIZE) + 1} to{' '}
              {Math.min(pagination.currentPage * PAGE_SIZE, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </p>
            
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="hidden sm:flex"
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <span className="text-sm px-3 py-1.5 bg-white border rounded-md">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-1" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="hidden sm:flex"
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}