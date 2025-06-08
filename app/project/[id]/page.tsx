import { EnhancedWorkspace } from '@/components/project/enhanced-workspace';
import { AuthCheck } from '@/components/auth-check';

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <AuthCheck>
      <EnhancedWorkspace projectId={params.id} />
    </AuthCheck>
  );
}