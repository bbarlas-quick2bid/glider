import { clsx } from 'clsx';
import {
  Reply,
  Calendar,
  Forward,
  Archive,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { RecommendedAction, Confidence } from '@/lib/types/ai';

interface RecommendationChipsProps {
  action: RecommendedAction;
  reason: string;
  confidence: Confidence;
}

const actionConfig: Record<
  RecommendedAction,
  { icon: any; label: string; color: string }
> = {
  reply: { icon: Reply, label: 'Reply', color: 'bg-blue-100 text-blue-800' },
  schedule_meeting: {
    icon: Calendar,
    label: 'Schedule',
    color: 'bg-purple-100 text-purple-800',
  },
  delegate: {
    icon: Forward,
    label: 'Delegate',
    color: 'bg-orange-100 text-orange-800',
  },
  archive: {
    icon: Archive,
    label: 'Archive',
    color: 'bg-gray-100 text-gray-800',
  },
  follow_up: {
    icon: Clock,
    label: 'Follow-up',
    color: 'bg-yellow-100 text-yellow-800',
  },
  prioritize: {
    icon: AlertCircle,
    label: 'Urgent',
    color: 'bg-red-100 text-red-800',
  },
};

export function RecommendationChips({
  action,
  reason,
  confidence,
}: RecommendationChipsProps) {
  const config = actionConfig[action];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium',
            config.color
          )}
          title={reason}
        >
          <Icon className="h-4 w-4" />
          {config.label}
        </span>
        <span className="text-xs text-gray-500">
          {confidence} confidence
        </span>
      </div>
      <p className="text-sm text-gray-600">{reason}</p>
    </div>
  );
}
