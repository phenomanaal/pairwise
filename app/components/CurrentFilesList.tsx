'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProcessingPopup from './ui/ProcessingPopup';
import SuccessPopup from './ui/SuccessPopup';
import MatchingFilesView from './MatchingFilesViews';
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

const CurrentFilesList = ({
  matching = false,
  onAllMatchesComplete,
}: CurrentFilesListProps) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);

  const [completedMatches, setCompletedMatches] = useState<number>(0);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [allMatchesCompleted, setAllMatchesCompleted] =
    useState<boolean>(false);
  const [showResultsOverview, setShowResultsOverview] =
    useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const validExternalFileTypes: Record<string, boolean> = {
      'state-dept-corrections-felons-list': true,
      'dept-of-vital-stats-deceased-list': true,
      'change-of-address-record': true,
      'other-voter-file': true,
    };

    const fetchFiles = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/pairwise/files', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        if (matching) {
          const validExternalFiles = data.filter(
            (file: FileData) =>
              file.fileType === 'external' &&
              file.externalFileType &&
              validExternalFileTypes[file.externalFileType],
          );

          setTotalMatches(validExternalFiles.length);

          const alreadyMatchedCount = validExternalFiles.filter(
            (file: FileData) => file.matchStatus,
          ).length;

          const processedFiles = data.map((file: FileData) => {
            const isValidMatchingFile =
              file.fileType === 'external' &&
              file.externalFileType &&
              validExternalFileTypes[file.externalFileType];

            const validFileIndex = isValidMatchingFile
              ? validExternalFiles.findIndex(
                  (vFile: FileData) =>
                    vFile.fileName === file.fileName &&
                    vFile.fileType === file.fileType &&
                    vFile.externalFileType === file.externalFileType,
                )
              : -1;

            let matchingStatus;
            if (file.matchStatus) {
              matchingStatus = 'completed';
            } else if (validFileIndex === 0) {
              matchingStatus = 'active';
            } else if (validFileIndex > 0) {
              matchingStatus = 'pending';
            }

            return {
              ...file,
              matchingStatus,
            };
          });

          setFiles(processedFiles);

          setCompletedMatches(alreadyMatchedCount);

          if (alreadyMatchedCount === 0) {
            const activeIndex = processedFiles.findIndex(
              (file: FileData) => file.matchingStatus === 'active',
            );
            if (activeIndex !== -1) {
              setActiveFileIndex(activeIndex);
            }
          }

          setAllMatchesCompleted(
            alreadyMatchedCount === validExternalFiles.length &&
              validExternalFiles.length > 0,
          );
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

  const handleBeginMatching = async (fileId: string) => {
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/pairwise/match', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: fileId,
        }),
      });

      if (!response.ok) {
        throw new Error('Matching API request failed');
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccessPopup(true);
      }, 2000);
    } catch (error) {
      console.error('Error during matching:', error);
      setIsProcessing(false);
    }
  };

  const handleContinue = () => {
    setShowSuccessPopup(false);

    const updatedFiles = [...files];

    updatedFiles[activeFileIndex].matchingStatus = 'completed';
    updatedFiles[activeFileIndex].matchStatus = true;

    const newCompletedCount = completedMatches + 1;
    setCompletedMatches(newCompletedCount);

    const nextPendingIndex = updatedFiles.findIndex(
      (file: FileData) => file.matchingStatus === 'pending',
    );

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

    router.push('/download');
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
        <ResultsOverview file={selectedFile} onBack={handleBackToMatching} />
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
