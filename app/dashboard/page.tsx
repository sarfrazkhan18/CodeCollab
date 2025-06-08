import { DashboardShell } from '@/components/dashboard/shell';
import { AuthCheck } from '@/components/auth-check';

export default function Dashboard() {
  return (
    <AuthCheck>
      <DashboardShell />
    </AuthCheck>
  );
}