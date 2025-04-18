'use client';

import { useState, useEffect } from 'react';
import ProcessingPopup from './ui/ProcessingPopup';
import SuccessPopup from './ui/SuccessPopup';
import MatchingFilesView from './MatchingFilesViews'
import ResultsOverview from './ResultsOverview';

export interface FileData {
  id: string;
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  matchStatus: boolean;
  downloadStatus: boolean;
  matchingStatus?: 'pending' | 'active' | 'completed';
}

interface CurrentFilesListProps {
  matching?: boolean;
  onAllMatchesComplete?: () => void;
}

const CurrentFilesList = ({ matching = false, onAllMatchesComplete }: CurrentFilesListProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  
  const [completedMatches, setCompletedMatches] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [allMatchesCompleted, setAllMatchesCompleted] = useState<boolean>(false);
  const [showResultsOverview, setShowResultsOverview] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);

  const validExternalFileTypes = {
    'state-dept-corrections-felons-list': true,
    'dept-of-vital-stats-deceased-list': true,
    'change-of-address-record': true,
    'other-voter-file': true
  };

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/pairwise/files', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        
        const data = await response.json();
        
        if (matching) {
          const validExternalFiles = data.filter((file: FileData) => 
            file.fileType === 'external' && 
            file.externalFileType && 
            validExternalFileTypes[file.externalFileType]
          );      
          
          setTotalMatches(validExternalFiles.length);    

          const processedFiles = data.map((file: FileData) => {
            const isValidMatchingFile = 
              file.fileType === 'external' && 
              file.externalFileType && 
              validExternalFileTypes[file.externalFileType];
              
            const validFileIndex = isValidMatchingFile 
              ? validExternalFiles.findIndex(vFile => 
                  vFile.fileName === file.fileName && 
                  vFile.fileType === file.fileType && 
                  vFile.externalFileType === file.externalFileType
                )
              : -1;            

            return {
              ...file,
              matchingStatus: validFileIndex === 0 
                ? 'active' 
                : validFileIndex > 0 
                  ? 'pending' 
                  : undefined
            };
          });
          
          setFiles(processedFiles);          

          const activeIndex = processedFiles.findIndex(file => file.matchingStatus === 'active');
          if (activeIndex !== -1) {
            setActiveFileIndex(activeIndex);
          }
          
          const completed = processedFiles.filter(file => file.matchingStatus === 'completed').length;
          setCompletedMatches(completed);
          setAllMatchesCompleted(completed === validExternalFiles.length && validExternalFiles.length > 0);
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
    
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessPopup(true);
    }, 2000);
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);
    
    const updatedFiles = [...files];
    
    updatedFiles[activeFileIndex].matchingStatus = 'completed';
    
    const newCompletedCount = completedMatches + 1;
    setCompletedMatches(newCompletedCount);
    
    const nextPendingIndex = updatedFiles.findIndex(file => file.matchingStatus === 'pending');
    
    if (nextPendingIndex !== -1) {
      updatedFiles[nextPendingIndex].matchingStatus = 'active';
      setActiveFileIndex(nextPendingIndex);
    } else {
      setAllMatchesCompleted(true);
    }
    
    setFiles(updatedFiles);
  };

  const handleContinueToDownload = () => {
    if (onAllMatchesComplete) {
      onAllMatchesComplete();
    }
    
    window.location.href = '/download';
  };

  const handleViewResults = (file: FileData) => {
    setSelectedFile(file);
    setShowResultsOverview(true);
  };

  const handleBackToMatching = () => {
    setShowResultsOverview(false);
    setSelectedFile(null);
  };

  return (
    <div className="relative">
      {!showResultsOverview ? (
        <MatchingFilesView 
          files={files}
          loading={loading}
          error={error}
          matching={matching}
          totalMatches={totalMatches}
          completedMatches={completedMatches}
          allMatchesCompleted={allMatchesCompleted}
          onBeginMatching={handleBeginMatching}
          onViewResults={handleViewResults}
          onContinue={handleContinueToDownload}
        />
      ) : (
        <ResultsOverview 
          file={selectedFile}
          onBack={handleBackToMatching}
        />
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