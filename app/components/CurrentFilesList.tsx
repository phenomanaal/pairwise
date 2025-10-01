'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProcessingPopup from './ui/ProcessingPopup';
import SuccessPopup from './ui/SuccessPopup';
import ErrorPopup from './ui/ErrorPopup';
import MatchingFilesView from './MatchingFilesViews';
import ResultsOverview from './ResultsOverview';
import Box from './Box';
import Button from './ui/Button';
import Navbar from './Navbar';
import ProtectedRoute from './ProtectedRoute';
import { strings } from '@/app/utils/strings';

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
  const [showMatchError, setShowMatchError] = useState<boolean>(false);
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
          throw new Error(strings.errors.serverStatus.replace('{status}', String(response.status)));
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
        setError(strings.errors.failedToLoad);
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
        setIsProcessing(false);
        setShowMatchError(true);
        return;
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccessPopup(true);
      }, 2000);
    } catch (error) {
      console.error('Error during matching:', error);
      setIsProcessing(false);
      setShowMatchError(true);
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

  const handleRetryMatching = () => {
    setShowMatchError(false);
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
        title={strings.popupTitles.processing}
        message={strings.processing.matchingInProgress}
      />

      <SuccessPopup
        isOpen={showSuccessPopup}
        title={strings.popupTitles.matchingComplete}
        message={strings.success.matchingComplete}
        onContinue={handleContinue}
      />

    <ErrorPopup
      isOpen={showMatchError}
      title={strings.popupTitles.serverError}
      message={strings.errors.matchingServerError}
      onContinue={handleRetryMatching}
    />
    </div>
  );
};

export default CurrentFilesList;
