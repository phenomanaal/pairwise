// pages/download.tsx or app/download/page.tsx (depending on your Next.js version)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // or 'next/router' for Pages Router
import Button from '../components/ui/Button';
import ProcessingPopup from '../components/ui/ProcessingPopup';
import SuccessPopup from '../components/ui/SuccessPopup';

interface MatchResult {
  fileType: string;
  externalFileType: string | null;
  fileName: string;
  downloadStatus: 'pending' | 'downloaded';
  resultFileId: string;
}

interface DownloadListItemProps {
  result: MatchResult;
  onDownload: (resultId: string) => void;
}

const DownloadListItem = ({ result, onDownload }: DownloadListItemProps) => {
  const typeMap: {[key: string]: string} = {
    'state-dept-corrections-felons-list': 'State Department of Corrections Felons List',
    'dept-of-vital-stats-deceased-list': 'Department of Vital Statistics Deceased Persons List',
    'change-of-address-record': 'Change of Address Record',
    'other-voter-file': 'Other State Voter File'
  };
  
  const getExternalFileTypeDisplay = (type: string | null): string => {
    if (!type) return '';
    return typeMap[type] || type;
  };

  return (
    <li className="flex items-center">
      <span className="text-gray-700">
        {result.fileType === 'voter' ? 'Voter File: ' : 
         result.fileType === 'external' ? `External (${getExternalFileTypeDisplay(result.externalFileType)}): ` :
         `${result.fileType}: `}
      </span>
      <span className="ml-2 italic text-gray-600">{result.fileName}</span>
      <div className='ml-auto'>
        {result.downloadStatus === 'pending' ? (
          <Button 
            onClick={() => onDownload(result.resultFileId)}
            className="ml-4"
          >
            Download Results
          </Button>
        ) : (
          <div className="ml-4 flex items-center">
            <span className="text-green-600 font-semibold">Results Downloaded</span>
          </div>
        )}
      </div>
    </li>
  );
};

const DownloadPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(true);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [totalDownloads, setTotalDownloads] = useState<number>(0);
  const [allDownloadsCompleted, setAllDownloadsCompleted] = useState<boolean>(false);
  const [currentDownloadId, setCurrentDownloadId] = useState<string | null>(null);

  useEffect(() => {
    // Simulate file generation that takes some time
    const generationTimer = setTimeout(() => {
      setGenerating(false);
      fetchResults();
    }, 3000); // 3 seconds for demo purposes

    return () => clearTimeout(generationTimer);
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be an API call to get the results
      // For this demo, we'll create mock data
      const mockResults: MatchResult[] = [
        {
          fileType: 'external',
          externalFileType: 'state-dept-corrections-felons-list',
          fileName: 'felons_list_2023.csv',
          downloadStatus: 'pending',
          resultFileId: 'result-1'
        },
        {
          fileType: 'external',
          externalFileType: 'dept-of-vital-stats-deceased-list',
          fileName: 'deceased_persons_2023.csv',
          downloadStatus: 'pending',
          resultFileId: 'result-2'
        },
        {
          fileType: 'external',
          externalFileType: 'change-of-address-record',
          fileName: 'address_changes_q2_2023.csv',
          downloadStatus: 'pending',
          resultFileId: 'result-3'
        }
      ];

      setResults(mockResults);
      setTotalDownloads(mockResults.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (resultId: string) => {
    setCurrentDownloadId(resultId);
    setIsProcessing(true);
    
    // Simulate download process
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessPopup(true);
      
      // In a real app, this would trigger the actual file download
      // For example: window.location.href = `/api/download/${resultId}`;
    }, 2000);
  };

  const handleDownloadComplete = () => {
    setShowSuccessPopup(false);
    
    // Update the status of the downloaded file
    const updatedResults = results.map(result => {
      if (result.resultFileId === currentDownloadId) {
        return { ...result, downloadStatus: 'downloaded' };
      }
      return result;
    });
    
    // Increment downloaded count
    const newDownloadedCount = downloadedCount + 1;
    setDownloadedCount(newDownloadedCount);
    
    // Check if all downloads are completed
    const allCompleted = newDownloadedCount === totalDownloads;
    setAllDownloadsCompleted(allCompleted);
    
    setResults(updatedResults);
    setCurrentDownloadId(null);
  };

  const handleContinue = () => {
    // Navigate to the next page in your flow
    router.push('/completion');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Download Results</h1>
      
      {generating ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-700">Generating Results Files for Download...</p>
        </div>
      ) : (
        <div className="relative">
          <p>The following match results are ready for download:</p>
          
          {loading && <p className="mt-4">Loading results...</p>}
          
          {error && <p className="mt-4 text-red-500">{error}</p>}
          
          {!loading && !error && results.length === 0 && (
            <p className="mt-4 italic">No results are available for download.</p>
          )}
          
          {!loading && !error && results.length > 0 && (
            <>
              <ul className="space-y-4 pt-5 text-sm">
                {results.map((result, index) => (
                  <DownloadListItem 
                    key={index}
                    result={result}
                    onDownload={handleDownload}
                  />
                ))}
              </ul>
              
              <div className="mt-8 border-t pt-4">
                <div className="flex flex-col items-center">
                  <div className="font-medium text-gray-700 mb-4">
                    {downloadedCount} of {totalDownloads} Results Downloaded
                  </div>
                  
                  <Button 
                    onClick={handleContinue}
                    variant={allDownloadsCompleted ? "primary" : "disabled"}
                    className="px-8"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </>
          )}
          
          <ProcessingPopup 
            isOpen={isProcessing}
            title="Processing"
            message="Downloading file..."
          />
          
          <SuccessPopup 
            isOpen={showSuccessPopup}
            title="Download Complete"
            message="The file has been successfully downloaded."
            onContinue={handleDownloadComplete}
          />
        </div>
      )}
    </div>
  );
};

export default DownloadPage;