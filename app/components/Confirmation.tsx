'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useRouter } from 'next/navigation';

const Confirmation = ({}) => {
  const { logout } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setStep(2);
    }, 3000);

    const timer2 = setTimeout(() => {
      setStep(3);
    }, 6000);

    const timer3 = setTimeout(() => {
      setStep(4);
    }, 9000);

    const timer4 = setTimeout(() => {
      logout();
      router.push('/login');
    }, 12000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [logout, router]);

  if (step === 1) {
    return (
      <div>
        <p className="pb-6">
          Now that you&apos;ve confirmed completion of your list matching, and you&apos;ve downloaded all the results data, the final step is to clear all the data, including input files, voter data, results data, results files, and any working data. Pairwise does not retain any data that you provided or generated. In a few seconds, the data clearing process will begin automatically, and after completion you will be logged out.
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-lg text-gray-700">Clearing all data...</p>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div>
        <p className="pb-6">
          All session data has been deleted. You will now be automatically logged out.
        </p>
      </div>
    );
  }

  if (step === 4) {
    return (
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-lg text-gray-700">Logging out...</p>
      </div>
    );
  }

  return null;
};

export default Confirmation;
