import React from 'react';
import Button from './ui/Button';

interface FileData {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  matchingStatus?: 'pending' | 'active' | 'completed';
}

interface ResultsOverviewProps {
  file: FileData | null;
  onBack: () => void;
}

const ResultsOverview: React.FC<ResultsOverviewProps> = ({ file, onBack }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Results Overview</h2>
        <Button onClick={onBack} variant="secondary">
          Back
        </Button>
      </div>

      {file && (
        <>
          <div className="mb-4">
            <p className="font-medium mb-2">File Information:</p>
            <p className="text-sm text-gray-700 ml-2">
              {file.fileType === 'external'
                ? `External File (${file.externalFileType})`
                : file.fileType}
              : {file.fileName}
            </p>
          </div>

          <div className="mb-4">
            <p className="font-medium mb-2">Match Summary:</p>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="border-r pr-4">
                  <p className="text-sm text-gray-600 mb-2">Match Categories</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex justify-between">
                      <span>Exact Matches</span>
                      <span className="font-semibold">24</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Partial Matches</span>
                      <span className="font-semibold">18</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Possible Matches</span>
                      <span className="font-semibold">7</span>
                    </li>
                  </ul>
                </div>
                <div className="pl-4">
                  <p className="text-sm text-gray-600 mb-2">Match Details</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex justify-between">
                      <span>Name + Date of Birth</span>
                      <span className="font-semibold">15</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Name + Address</span>
                      <span className="font-semibold">9</span>
                    </li>
                    <li className="flex justify-between">
                      <span>SSN Only</span>
                      <span className="font-semibold">12</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Other Criteria</span>
                      <span className="font-semibold">13</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="font-medium mb-2">Processing Information:</p>
            <p className="text-sm text-gray-700 ml-2">
              This file was processed on {new Date().toLocaleDateString()} at{' '}
              {new Date().toLocaleTimeString()}
            </p>
            <p className="text-sm text-gray-700 ml-2 mt-1">
              Processing time: 3 minutes 24 seconds
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsOverview;
