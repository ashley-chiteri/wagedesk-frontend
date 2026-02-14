// pages/preparation/index.tsx
import { useState } from 'react';
import PreparationTabs from '@/components/payroll/runs/PreparationTabs';

export default function PreparationLayout() {
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <div>Overview content</div>;
      case 'earnings':
        return <div>Earnings Breakdown content</div>;
      case 'deductions':
        return <div>Deductions Breakdown content</div>;
      default:
        return null;
    }
  };

  return (
    <div>
      <PreparationTabs 
        onTabChange={setActiveTab}
        defaultActiveTab="overview"
      />
      
      <div className="mt-4">
        {renderContent()}
      </div>
    </div>
  );
}