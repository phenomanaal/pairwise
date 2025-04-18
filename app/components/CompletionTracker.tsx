import React from 'react';
import Button from './ui/Button';

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
  onContinue 
}) => {
  return (
    <div className="mt-8 border-t pt-4">
      <div className="flex flex-col items-center">
        <div className="font-medium text-gray-700 mb-4">
          {completedMatches} of {totalMatches} Matches Complete
        </div>
        
        <Button 
          onClick={onContinue}
          variant={allMatchesCompleted ? "primary" : "disabled"}
          className="px-8"
          title={!allMatchesCompleted ? "Please complete all list matches in order to continue" : ""}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default CompletionTracker;