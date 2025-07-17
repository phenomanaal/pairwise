'use client';

import { useRouter } from 'next/navigation';
import Button from './ui/Button';

const WelcomeChecklist = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/voter-file');
  };

  return (
    <div>
      <p>
        Welcome to PairWise. To get started, please follow this checklist to ensure that you are
        ready to perform PairWise list matching.
      </p>
      <ul className="space-y-2 pt-5">
        <li className="flex items-center">
          <input
            type="checkbox"
            checked
            className="w-5 h-5 text-black bg-black-100 border-black-300 rounded-md cursor-default"
            disabled
          />
          <span className="ml-2">Checklist TBD</span>
        </li>
      </ul>
      <div className="mt-8">
        <Button onClick={handleContinue} fullWidth>
          Continue
        </Button>
      </div>
    </div>
  );
};

export default WelcomeChecklist;
