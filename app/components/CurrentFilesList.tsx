// components/CurrentFilesList.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import ProcessingPopup from './ui/ProcessingPopup';
import SuccessPopup from './ui/SuccessPopup';

interface FileData {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  matchingStatus?: 'pending' | 'active' | 'completed';
}

interface FileListItemProps {
  file: FileData;
  isMatching: boolean;
  onBeginMatching: () => void;
}

const FileListItem = ({ file, isMatching, onBeginMatching }: FileListItemProps) => {
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

  const renderMatchingControls = () => {
    if (!isMatching) return null;
    
    switch (file.matchingStatus) {
      case 'active':
        return (
          <Button 
            onClick={onBeginMatching}
            className="ml-4"
          >
            Begin Matching
          </Button>
        );
      case 'completed':
        return (
          <div className="ml-4 flex items-center">
            <span className="text-green-600 font-semibold mr-3">Completed</span>
            <Button>
              Results Overview
            </Button>
          </div>
        );
      case 'pending':
        return (
          <Button 
            variant="disabled"
            className="ml-4"
          >
            Begin Matching
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <li className="flex items-center">
      <span className="text-gray-700">
        {file.fileType === 'voter' ? 'Voter File: ' : 
         file.fileType === 'external' ? `External (${getExternalFileTypeDisplay(file.externalFileType)}): ` :
         `${file.fileType}: `}
      </span>
      <span className="ml-2 italic text-gray-600">{file.fileName}</span>
      {renderMatchingControls()}
    </li>
  );
};

interface CurrentFilesListProps {
  matching?: boolean;
}

const CurrentFilesList = ({ matching = false }: CurrentFilesListProps) => {
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

  const handleBeginMatching = () => {
    setIsProcessing(true);
    
    // Simulate processing time
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
            <FileListItem 
              key={index}
              file={file}
              isMatching={matching}
              onBeginMatching={handleBeginMatching}
            />
          ))}
        </ul>
      )}
      
      <ProcessingPopup 
        isOpen={isProcessing}
        title="Processing"
        message="Matching files in progress..."
      />
      
      <SuccessPopup 
        isOpen={showSuccessPopup}
        title="Matching Complete"
        message="The matching process has completed successfully."
        onContinue={handleContinue}
      />
    </div>
  );
};

export default CurrentFilesList;