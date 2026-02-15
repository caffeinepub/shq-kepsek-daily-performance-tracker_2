import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  maxScore?: number;
  className?: string;
}

export function ScoreBadge({ score, maxScore = 100, className }: ScoreBadgeProps) {
  const percentage = (score / maxScore) * 100;
  
  let variant: 'default' | 'secondary' | 'destructive' = 'secondary';
  let colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  
  if (percentage >= 80) {
    variant = 'default';
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300';
  } else if (percentage >= 60) {
    colorClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300';
  } else if (percentage < 40) {
    variant = 'destructive';
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300';
  }

  return (
    <Badge variant={variant} className={cn(colorClass, 'font-semibold', className)}>
      {score}/{maxScore}
    </Badge>
  );
}

interface SubmissionStatusBadgeProps {
  submitted: boolean;
  className?: string;
}

export function SubmissionStatusBadge({ submitted, className }: SubmissionStatusBadgeProps) {
  if (submitted) {
    return (
      <Badge 
        variant="default" 
        className={cn('bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300', className)}
      >
        Submitted
      </Badge>
    );
  }

  return (
    <Badge 
      variant="destructive" 
      className={cn('bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300', className)}
    >
      Not Submitted
    </Badge>
  );
}

interface CategoryScoreBadgeProps {
  score: number;
  maxScore: number;
  label: string;
  className?: string;
}

export function CategoryScoreBadge({ score, maxScore, label, className }: CategoryScoreBadgeProps) {
  const isComplete = score === maxScore;
  
  return (
    <div className={cn('flex items-center justify-between p-2 rounded-md border', className)}>
      <span className="text-sm font-medium">{label}</span>
      <Badge 
        variant={isComplete ? 'default' : 'secondary'}
        className={isComplete ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : ''}
      >
        {score}/{maxScore}
      </Badge>
    </div>
  );
}
