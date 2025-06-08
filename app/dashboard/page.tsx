import { EnhancedDashboardShell } from '@/components/dashboard/enhanced-shell';
import { AuthCheck } from '@/components/auth-check';

export default function Dashboard() {
  return (
    <AuthCheck>
      <EnhancedDashboardShell />
    </AuthCheck>
  );
}