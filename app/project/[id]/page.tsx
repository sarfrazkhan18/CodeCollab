import { EnhancedWorkspaceV2 } from '@/components/project/enhanced-workspace-v2';
import { AuthCheck } from '@/components/auth-check';

export async function generateStaticParams() {
  // Return an array of possible project IDs for static generation
  // In a real application, you might fetch these from your database
  return [
    { id: 'demo' },
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