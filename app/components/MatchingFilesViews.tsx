import React from 'react';
import FileListItem from './FileListItem';
import CompletionTracker from './CompletionTracker';
import { FileData } from './CurrentFilesList';
import { strings, formatString } from '@/app/utils/strings';

interface MatchingFilesViewProps {
  files: FileData[];
  loading: boolean;
  error: string | null;
  matching: boolean;
  totalMatches: number;
  completedMatches: number;
  allMatchesCompleted: boolean;
  onBeginMatching: (fileId: string) => void;
  onViewResults: (file: FileData) => void;
  onContinue: () => void;
}

const MatchingFilesView: React.FC<MatchingFilesViewProps> = ({
  files,
  loading,
  error,
  matching,
  totalMatches,
  completedMatches,
  allMatchesCompleted,
  onBeginMatching,
  onViewResults,
  onContinue,
}) => {
  return (
    <>
      <p>{formatString(strings.instructions.matchingInstructions, { count: String(totalMatches) })}</p>

      {loading && <p className="mt-4">{strings.common.loadingFiles}</p>}

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {!loading && !error && files.length === 0 && (
        <p className="mt-4 italic">{strings.status.noFiles}</p>
      )}

      {!loading && !error && files.length > 0 && (
        <>
          <ul className="space-y-4 pt-5 text-sm">
            {files.map((file, index) => (
              <FileListItem
                key={index}
                file={file}
                isMatching={matching}
                onBeginMatching={onBeginMatching}
                onViewResults={onViewResults}
              />
            ))}
          </ul>

          {matching && totalMatches > 0 && (
            <CompletionTracker
              completedMatches={completedMatches}
              totalMatches={totalMatches}
              allMatchesCompleted={allMatchesCompleted}
              onContinue={onContinue}
            />
          )}
        </>
      )}
    </>
  );
};

export default MatchingFilesView;
