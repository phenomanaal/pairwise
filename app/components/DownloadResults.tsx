'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import ProcessingPopup from './ui/ProcessingPopup';
import SuccessPopup from './ui/SuccessPopup';
import ErrorPopup from './ui/ErrorPopup';
import { strings, formatString } from '@/app/utils/strings';

interface MatchResult {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  downloadStatus: boolean;
  downloadingStatus: 'pending' | 'downloaded';
  id: string;
}

interface DownloadResultsProps {
  onAllDownloadsComplete?: () => void;
}

const DownloadResults = ({ onAllDownloadsComplete }: DownloadResultsProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(true);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [allDownloadsCompleted, setAllDownloadsCompleted] =
    useState<boolean>(false);
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(
    null,
  );
  const [showErrorPopup, setShowErrorPopup] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const typeMap: { [key: string]: string } = {
    'state-dept-corrections-felons-list':
      'State Department of Corrections Felons List',
    'dept-of-vital-stats-deceased-list':
      'Department of Vital Statistics Deceased Persons List',
    'change-of-address-record': 'Change of Address Record',
    'other-voter-file': 'Other State Voter File',
  };

  const getExternalFileTypeDisplay = (type: string | null): string => {
    if (!type) return '';
    return typeMap[type] || type;
  };

  const getOutputFileName = (voterFileName: string, externalFileName: string): string => {
    // Remove file extensions if present
    const voterBase = voterFileName.replace(/\.[^/.]+$/, '');
    const externalBase = externalFileName.replace(/\.[^/.]+$/, '');
    return `${voterBase}-${externalBase}-comparison.csv`;
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/pairwise/files', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();
      const processedResults = data.map((result: MatchResult) => ({
        ...result,
        downloadingStatus: result.downloadStatus ? 'downloaded' : 'pending',
      }));

      const externalFilesCount = processedResults.filter(
        (r: MatchResult) => r.fileType != 'voter',
      ).length;

      const alreadyDownloadedCount = processedResults.filter(
        (r: MatchResult) => r.downloadingStatus === 'downloaded' && r.fileType != 'voter',
      ).length;

      setResults(processedResults);
      setTotalDownloads(externalFilesCount);
      setDownloadedCount(alreadyDownloadedCount);
      setAllDownloadsCompleted(
        alreadyDownloadedCount === externalFilesCount && externalFilesCount > 0,
      );
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(strings.errors.failedToLoadResults);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const generationTimer = setTimeout(() => {
      setGenerating(false);
      fetchResults();
    }, 3000);
    return () => clearTimeout(generationTimer);
  }, []);

  const handleDownload = async (resultId: string) => {
    setCurrentDownloadId(resultId);
    setIsProcessing(true);

    try {
      const response = await fetch('http://localhost:3001/pairwise/download', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: resultId,
        }),
      });

      if (!response.ok) {
        throw new Error(strings.errors.downloadApiError);
      }

      setTimeout(() => {
        setIsProcessing(false);
        setShowSuccessPopup(true);
      }, 2000);
    } catch (error) {
      console.error('Error during download:', error);
      setIsProcessing(false);
      setErrorMessage(strings.errors.downloadFailed);
      setShowErrorPopup(true);
    }
  };

  const handleDownloadComplete = () => {
    setShowSuccessPopup(false);

    const updatedResults = results.map((result) => {
      if (result.id === currentDownloadId) {
        return {
          ...result,
          downloadingStatus: 'downloaded' as const,
          downloadStatus: true,
        };
      }
      return result;
    });

    const newDownloadedCount = downloadedCount + 1;
    setDownloadedCount(newDownloadedCount);

    const allCompleted = newDownloadedCount === totalDownloads;
    setAllDownloadsCompleted(allCompleted);

    setResults(updatedResults);
    setCurrentDownloadId(null);
  };

  const handleContinue = () => {
    if (onAllDownloadsComplete) {
      onAllDownloadsComplete();
    }

    router.push('/confirm-completion');
  };

  const voterFile = results.find((r) => r.fileType === 'voter');
  const voterFileName = voterFile?.fileName || '';

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-lg text-gray-700">
          {strings.processing.generatingResults}
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <p>{strings.instructions.resultsAvailable}</p>

      {loading && <p className="mt-4">{strings.common.loadingResults}</p>}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {!loading && !error && results.length === 0 && (
        <p className="mt-4 italic">{strings.status.noResults}</p>
      )}

      {!loading && !error && results.length > 0 && (
        <>
          <ul className="space-y-4 pt-5 text-sm">
            {results.map((result, index) => (
              <li key={index} className="flex flex-col">
                <div className="flex items-center">
                  <span className="text-gray-700">
                    {result.fileType === 'voter'
                      ? 'Voter File: '
                      : result.fileType === 'external'
                        ? `External (${getExternalFileTypeDisplay(result.externalFileType)}): `
                        : `${result.fileType}: `}
                  </span>
                  <span className="ml-2 italic text-gray-600">
                    {result.fileName}
                  </span>
                  {result.fileType === 'external' ? (
                    <div className="ml-auto">
                      {!result.downloadStatus ? (
                        <Button
                          onClick={() => handleDownload(result.id)}
                          className="ml-4"
                        >
                          {strings.buttons.downloadResults}
                        </Button>
                      ) : (
                        <div className="ml-4 flex items-center">
                          <span className="text-green-600 font-semibold">
                            {strings.status.downloadCompleteStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span></span>
                  )}
                </div>
                {result.fileType === 'external' && (
                  <div className="ml-4 mt-1">
                    <span className="text-gray-600 text-xs">
                      Output File: {getOutputFileName(voterFileName, result.fileName)}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t pt-4">
            <div className="flex flex-col items-center">
              <div className="font-medium text-gray-700 mb-4">
                {formatString(strings.status.downloadsComplete, { count: String(downloadedCount), total: String(totalDownloads) })}
              </div>

              <Button
                onClick={handleContinue}
                variant={allDownloadsCompleted ? 'primary' : 'disabled'}
                className="px-8"
              >
                {strings.buttons.continue}
              </Button>
            </div>
          </div>
        </>
      )}

      <ProcessingPopup
        isOpen={isProcessing}
        title={strings.popupTitles.processing}
        message={strings.processing.downloadingFile}
      />

      <SuccessPopup
        isOpen={showSuccessPopup}
        title={strings.popupTitles.downloadComplete}
        message={strings.success.downloadComplete}
        onContinue={handleDownloadComplete}
      />

      <ErrorPopup
        isOpen={showErrorPopup}
        title={strings.popupTitles.downloadError}
        message={errorMessage}
        onContinue={() => setShowErrorPopup(false)}
      />
    </div>
  );
};

export default DownloadResults;