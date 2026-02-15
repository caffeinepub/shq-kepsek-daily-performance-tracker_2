import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyReport } from '../../backend';

interface DailyProgressIndicatorsProps {
  report: DailyReport;
  className?: string;
}

interface CategoryStatus {
  label: string;
  completed: boolean;
  shortLabel: string;
}

export default function DailyProgressIndicators({ report, className }: DailyProgressIndicatorsProps) {
  // Helper to safely check if attendance photo exists
  const hasAttendancePhoto = (): boolean => {
    try {
      if (!report.attendancePhoto) return false;
      // Check if it's a valid ExternalBlob with getDirectURL method
      if (typeof report.attendancePhoto === 'object' && 'getDirectURL' in report.attendancePhoto) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Helper to safely convert score to number
  const toScore = (value: bigint | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    return Number(value);
  };

  // Determine completion status for each category
  // A category is complete if score > 0 (indicating data was submitted)
  const categories: CategoryStatus[] = [
    {
      label: 'Attendance',
      shortLabel: 'Att',
      completed: toScore(report.attendanceScore) > 0 && hasAttendancePhoto(),
    },
    {
      label: 'Class Control',
      shortLabel: 'Class',
      completed: toScore(report.classControlScore) > 0,
    },
    {
      label: 'Teacher Control',
      shortLabel: 'Teach',
      completed: toScore(report.teacherControlScore) > 0,
    },
    {
      label: 'Parent Response',
      shortLabel: 'Parent',
      completed: toScore(report.waliSantriResponseScore) > 0,
    },
    {
      label: 'Program & Problem Solving',
      shortLabel: 'Prog',
      completed: toScore(report.programProblemSolvingScore) > 0,
    },
  ];

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {categories.map((category) => (
        <Badge
          key={category.label}
          variant={category.completed ? 'default' : 'secondary'}
          className={cn(
            'text-xs px-2 py-0.5 flex items-center gap-1',
            category.completed
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-300'
          )}
          title={category.label}
        >
          {category.completed ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <XCircle className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">{category.shortLabel}</span>
        </Badge>
      ))}
    </div>
  );
}
