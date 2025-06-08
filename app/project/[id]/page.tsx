import { EnhancedWorkspaceV2 } from '@/components/project/enhanced-workspace-v2';
import { AuthCheck } from '@/components/auth-check';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <AuthCheck>
      <EnhancedWorkspaceV2 projectId={params.id} />
    </AuthCheck>
  );
}