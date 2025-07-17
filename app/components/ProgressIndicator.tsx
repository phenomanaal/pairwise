'use client';

import { usePathname } from 'next/navigation';

const steps = [
  { name: 'Voter File Upload', path: '/voter-file' },
  { name: 'Upload External Files', path: '/external-file' },
  { name: 'List Matching', path: '/match-files' },
  { name: 'Download Results', path: '/download' },
  { name: 'Clear All Data', path: '/finish' },
];

const ProgressIndicator = () => {
  const pathname = usePathname();
  
  const currentStepIndex = steps.findIndex(step => step.path === pathname);
  
  return (
    <div className="flex items-center justify-center space-x-2 pt-6 pb-2">
      {steps.map((step, index) => {
        let stepStatus = 'pending';
        if (index < currentStepIndex) {
          stepStatus = 'completed';
        } else if (index === currentStepIndex) {
          stepStatus = 'current';
        }
        
        return (
          <div
            key={step.name}
            className={`
              px-4 py-2 text-sm font-medium rounded-md
              ${stepStatus === 'completed' 
                ? 'bg-green-100 text-green-800 border-2 border-green-300' 
                : stepStatus === 'current' 
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-500' 
                : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
              }
              ${index < steps.length - 1 ? 'clip-path-arrow' : ''}
            `}
            style={{
              clipPath: index < steps.length - 1 
                ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)' 
                : undefined
            }}
          >
            {step.name}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;