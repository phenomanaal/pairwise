import React from 'react';
import Button from './ui/Button';
import { strings, formatString } from '@/app/utils/strings';

interface CompletionTrackerProps {
  completedMatches: number;
  totalMatches: number;
  allMatchesCompleted: boolean;
  onContinue: () => void;
}

const CompletionTracker: React.FC<CompletionTrackerProps> = ({
  completedMatches,
  totalMatches,
  allMatchesCompleted,
  onContinue,
}) => {
  return (
    <div className="mt-8 border-t pt-4">
      <div className="flex flex-col items-center">
        <div className="font-medium text-gray-700 mb-4">
          {allMatchesCompleted ? (
            <div>
              <p className="mb-4">{strings.success.matchingCompleteAll}</p>
            </div>
          ) : (
            <p>{formatString(strings.status.matchesComplete, { count: String(completedMatches), total: String(totalMatches) })}</p>
          )}
        </div>

        <Button
          onClick={onContinue}
          variant={allMatchesCompleted ? 'primary' : 'disabled'}
          className="px-8"
          title={
            !allMatchesCompleted
              ? strings.confirmations.completionTooltip
              : ''
          }
        >
          {strings.buttons.continue}
        </Button>
      </div>
    </div>
  );
};

export default CompletionTracker;
