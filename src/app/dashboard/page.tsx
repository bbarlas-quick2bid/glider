'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmailCard } from '@/components/dashboard/EmailCard';
import { Spinner } from '@/components/ui/Spinner';
import { Email } from '@/lib/types/email';
import { EmailAnalysis } from '@/lib/types/ai';

interface EmailWithAnalysis extends Email {
  analysis?: EmailAnalysis;
}

export default function DashboardPage() {
  const queryClient = useQueryClient();

  // Fetch emails
  const {
    data: emailsData,
    isLoading: emailsLoading,
    error: emailsError,
  } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      const res = await fetch('/api/emails/fetch');
      if (!res.ok) throw new Error('Failed to fetch emails');
      const json = await res.json();
      return json.data.emails;
    },
  });

  // Fetch analyses
  const { data: analysesData } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      const res = await fetch('/api/analyze');
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!emailsData && emailsData.length > 0,
  });

  // Trigger analysis mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/analyze', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to analyze emails');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    },
  });

  // Refresh mutation (fetch new emails + analyze)
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/emails/fetch?refresh=true');
      if (!res.ok) throw new Error('Failed to refresh emails');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      // Trigger analysis after refresh
      setTimeout(() => analyzeMutation.mutate(), 1000);
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  // Combine emails with their analyses
  const emailsWithAnalyses: EmailWithAnalysis[] = emailsData
    ? emailsData.map((email: Email) => {
        // Find matching analysis by email ID
        const analysis = analysesData?.find(
          (a: any) => a.emailId === email.id
        );
        return { ...email, analysis };
      })
    : [];

  // Trigger initial analysis if we have unanalyzed emails
  const hasUnanalyzed = emailsWithAnalyses.some(e => !e.analysis);
  if (hasUnanalyzed && !analyzeMutation.isPending && emailsData) {
    analyzeMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={refreshMutation.isPending}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Your Emails</h1>
          <p className="text-gray-600">
            AI-powered insights for your inbox
          </p>
        </div>

        {emailsLoading && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {emailsError && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800">
            Failed to load emails. Please try refreshing.
          </div>
        )}

        {analyzeMutation.isPending && (
          <div className="mb-4 rounded-lg bg-blue-50 p-4 text-blue-800">
            Analyzing emails with AI...
          </div>
        )}

        {emailsWithAnalyses.length === 0 && !emailsLoading && (
          <div className="rounded-lg bg-gray-100 p-8 text-center">
            <p className="text-gray-600">
              No emails found. Click refresh to fetch your latest emails.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {emailsWithAnalyses.map((email) => (
            <EmailCard key={email.id} email={email} analysis={email.analysis} />
          ))}
        </div>
      </main>
    </div>
  );
}
