import { Clock, Ban, Building2, PlusCircle, Mail, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import EmptyState from "@/components/common/emptyState";
import { CompanyCard } from "@/components/dashboard/companyCard";
import { Button } from "@/components/ui/button";

const RootDashboard = () => {
  const {
    activeWorkspace,
    isWorkspacePending,
    isWorkspaceSuspended,
  } = useAuthStore();

  // 1. No Workspace assigned at all
  if (!activeWorkspace) {
    return (
      <EmptyState
        icon={Building2}
        title="No Workspace Found"
        description="It looks like you aren't part of a workspace yet. Please contact your administrator to get started."
      />
    );
  }

  // 2. Workspace is Pending Review
  if (isWorkspacePending()) {
    return (
      <EmptyState
        icon={Clock}
        variant="warning"
        title="Pending Approval"
        description="Your workspace is currently under review by our team. We'll send you an email as soon as you're ready to go!"
      />
    );
  }

  // 3. Workspace is Suspended
  if (isWorkspaceSuspended()) {
    return (
      <EmptyState
        icon={Ban}
        variant="danger"
        title="Workspace Suspended"
        description="Access to this workspace has been restricted. If you believe this is a mistake, please reach out to our support team."
        actionLabel="Contact Support"
        actionIcon={Mail}
        onAction={() => window.open("mailto:wagedesk@gmail.com")}
      />
    );
  }

  const companies = activeWorkspace.workspaces.companies || [];

  // Show Empty State if no companies exist
  if (companies.length === 0) {
    return (
      <EmptyState
        icon={PlusCircle}
        title="Welcome to your Workspace"
        description="You're all set! Now, let's create your first company to start managing your payroll."
        actionLabel="Set up company"
        onAction={() => console.log("Navigate to multi-step setup")}
      />
    );
  }

//Show Grid if companies exis
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground"> Select a company to manage payroll and employees. </p>
        </div>
        <Button onClick={() => console.log("Add Company")} className="bg-[#1F3A8A]">
          <Plus className="mr-2 h-4 w-4" /> Add Company
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>
    </div>
  );
};

export default RootDashboard;