'use client';  // Ensure this is a client-side component

import { useState, useEffect } from 'react';

interface FileData {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  matchingStatus?: 'pending' | 'active' | 'completed';
}

interface Props {
  matching?: boolean;
}

const CurrentFilesList = ({ matching = false }: Props) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/pairwise/files');
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        // If matching is enabled, add matching status to files
        if (matching) {
          const filesWithStatus = data.map((file: FileData, index: number) => ({
            ...file,
            matchingStatus: index === 0 ? 'active' : 'pending'
          }));
          setFiles(filesWithStatus);
        } else {
          setFiles(data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [matching]);

  const getExternalFileTypeDisplay = (type: string | null): string => {
    if (!type) return '';
    
    const typeMap: {[key: string]: string} = {
      'state-dept-corrections-felons-list': 'State Department of Corrections Felons List',
      'dept-of-vital-stats-deceased-list': 'Department of Vital Statistics Deceased Persons List',
      'change-of-address-record': 'Change of Address Record',
      'other-voter-file': 'Other State Voter File'
    };
    
    return typeMap[type] || type;
  };

  const handleBeginMatching = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessPopup(true);
    }, 2000);
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);
    
    const updatedFiles = [...files];
    
    updatedFiles[activeFileIndex].matchingStatus = 'completed';
    
    if (activeFileIndex + 1 < files.length) {
      updatedFiles[activeFileIndex + 1].matchingStatus = 'active';
      setActiveFileIndex(activeFileIndex + 1);
    }
    
    setFiles(updatedFiles);
  };

  const renderMatchingControls = (file: FileData, index: number) => {
    if (!matching) return null;
    
    switch (file.matchingStatus) {
      case 'active':
        return (
          <button 
            onClick={handleBeginMatching}
            className="ml-4 px-3 py-1 bg-black text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
          >
            Begin Matching
          </button>
        );
      case 'completed':
        return (
          <div className="ml-4 flex items-center">
            <span className="text-green-600 font-semibold mr-3">Completed</span>
            <button 
              className="px-3 py-1 bg-gray-600 outline-black text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
            >
              Results Overview
            </button>
          </div>
        );
      case 'pending':
        return (
          <button 
            disabled
            className="ml-4 px-3 py-1 bg-gray-300 text-gray-500 rounded cursor-not-allowed"
          >
            Begin Matching
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <p>You uploaded the following files successfully:</p>
      
      {loading && <p className="mt-4">Loading files...</p>}
      
      {error && <p className="mt-4 text-red-500">{error}</p>}
      
      {!loading && !error && files.length === 0 && (
        <p className="mt-4 italic">No files have been uploaded yet.</p>
      )}
      
      {!loading && !error && files.length > 0 && (
        <ul className="space-y-4 pt-5 text-sm">
          {files.map((file, index) => (
            <li key={index} className="flex items-center">
              <span className="text-gray-700">
                {file.fileType === 'voter' ? 'Voter File: ' : 
                 file.fileType === 'external' ? `External (${getExternalFileTypeDisplay(file.externalFileType)}): ` :
                 `${file.fileType}: `}
              </span>
              <span className="ml-2 italic text-gray-600">{file.fileName}</span>
              {renderMatchingControls(file, index)}
            </li>
          ))}
        </ul>
      )}
      
      {/* Processing Popup */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-medium mb-4">Processing</h3>
            <p className="mb-4">Matching files in progress...</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gray-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-medium mb-4">Matching Complete</h3>
            <p className="mb-6">The matching process has completed successfully.</p>
            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentFilesList;