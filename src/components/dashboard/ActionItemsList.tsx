import { Check } from 'lucide-react';
import { ActionItem } from '@/lib/types/ai';
import { Badge } from '@/components/ui/Badge';

interface ActionItemsListProps {
  items: ActionItem[];
}

export function ActionItemsList({ items }: ActionItemsListProps) {
  if (items.length === 0) {
    return (
      <div className="text-sm text-gray-500">No action items</div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="flex items-start gap-2 rounded-md bg-gray-50 p-2"
        >
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-gray-300">
            <Check className="h-3 w-3 text-transparent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-900">{item.description}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge variant={item.priority as any}>
                {item.priority}
              </Badge>
              <Badge variant="default">{item.category.replace('_', ' ')}</Badge>
              <span className="text-xs text-gray-500">{item.estimatedTime}</span>
              {item.deadline && (
                <span className="text-xs text-gray-500">Due: {item.deadline}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
