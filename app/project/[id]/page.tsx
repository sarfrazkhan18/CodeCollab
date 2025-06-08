import { EnhancedWorkspaceV2 } from '@/components/project/enhanced-workspace-v2';
import { AuthCheck } from '@/components/auth-check';

// Generate static params for known demo projects
export async function generateStaticParams() {
  return [
    { id: 'demo-instagram' },
    { id: 'demo-ecommerce' },
    { id: 'demo-tasks' },
    { id: 'sample' },
    { id: 'example' }
  ];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return (
    <AuthCheck>
      <EnhancedWorkspaceV2 projectId={params.id} />
    </AuthCheck>
  );
}