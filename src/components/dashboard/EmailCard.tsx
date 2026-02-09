'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { ActionItemsList } from './ActionItemsList';
import { RecommendationChips } from './RecommendationChips';
import { EmailAnalysis } from '@/lib/types/ai';
import { Email } from '@/lib/types/email';
import { clsx } from 'clsx';

interface EmailCardProps {
  email: Email;
  analysis?: EmailAnalysis;
}

export function EmailCard({ email, analysis }: EmailCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Determine priority border color
  const priorityColor = analysis?.actionItems?.[0]?.priority
    ? {
        high: 'border-l-4 border-l-red-500',
        medium: 'border-l-4 border-l-yellow-500',
        low: 'border-l-4 border-l-green-500',
      }[analysis.actionItems[0].priority]
    : '';

  // Sentiment indicator
  const sentimentBadge = analysis?.sentiment
    ? {
        urgent: '🔴',
        negative: '🔴',
        neutral: '⚪',
        positive: '🟢',
      }[analysis.sentiment]
    : '';

  return (
    <Card className={clsx('hover:shadow-md transition-shadow', priorityColor)}>
      {/* Email Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900">
              {email.subject || '(No subject)'}
            </h3>
            {sentimentBadge && <span className="text-sm">{sentimentBadge}</span>}
          </div>
          <p className="text-sm text-gray-600">
            From: {email.senderName || email.senderEmail}
          </p>
          <p className="text-xs text-gray-500">
            {format(new Date(email.emailDate), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          {expanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* AI Summary */}
      {analysis?.summary && (
        <div className="mt-3 rounded-md bg-blue-50 p-3">
          <p className="text-sm text-gray-700">{analysis.summary}</p>
        </div>
      )}

      {/* Action Items */}
      {analysis?.hasActionItems && analysis.actionItems.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Action Items
          </h4>
          <ActionItemsList items={analysis.actionItems} />
        </div>
      )}

      {/* Recommendation */}
      {analysis?.recommendedAction && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Recommended Action
          </h4>
          <RecommendationChips
            action={analysis.recommendedAction}
            reason={analysis.recommendationReason || ''}
            confidence={analysis.recommendationConfidence || 'medium'}
          />
        </div>
      )}

      {/* Expanded Email Body */}
      {expanded && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="max-h-96 overflow-y-auto rounded-md bg-gray-50 p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {email.bodyText || email.snippet}
            </pre>
          </div>
          <div className="mt-3 flex gap-2">
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Gmail
            </a>
          </div>
        </div>
      )}
    </Card>
  );
}
