import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BrainCircuitIcon, CodeIcon, TestTubeIcon } from 'lucide-react';

export function AgentCollaborationTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runCollaborationTest = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai/collaborate', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Collaboration test failed');
      
      const data = await response.json();
      setResults(data);
      
      toast({
        title: 'Collaboration Test Complete',
        description: 'AI agents have successfully collaborated on the task',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to run collaboration test',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={runCollaborationTest} 
        disabled={isLoading}
        className="w-full"
      >
        <BrainCircuitIcon className="mr-2 h-4 w-4" />
        {isLoading ? 'Running Test...' : 'Test Agent Collaboration'}
      </Button>

      {results && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CodeIcon className="h-5 w-5" />
                Code Review Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {results.review.content}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuitIcon className="h-5 w-5" />
                Frontend Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {results.improvements.content}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTubeIcon className="h-5 w-5" />
                Generated Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm">
                {results.tests.content}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}