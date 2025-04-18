import React from 'react';
import Button from './ui/Button';
import { FileData } from './CurrentFilesList';

interface FileListItemProps {
  file: FileData;
  isMatching: boolean;
  onBeginMatching: () => void;
  onViewResults: (file: FileData) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ 
  file, 
  isMatching, 
  onBeginMatching, 
  onViewResults 
}) => {
  // External file type display mapping
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

  const handleMatching = async () => { 
    try {
      const response = await fetch('http://localhost:3001/pairwise/match', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: file.id
        }),
      });

      if (response.ok) {
        onBeginMatching();
      } else {
        console.error('Matching API request failed:', await response.text());
      }
    } catch (error) {
      console.error('Error calling matching API:', error);
    }
  };

  const renderMatchingControls = () => {
    const isValidForMatching =
      isMatching &&
      file.fileType === 'external' &&
      file.externalFileType &&
      typeMap[file.externalFileType];
    
    if (!isValidForMatching) return null;
    
    switch (file.matchingStatus) {
      case 'active':
        return (
          <Button 
            onClick={handleMatching}
            className="ml-4"
          >
            Begin Matching
          </Button>
        );
      case 'completed':
        return (
          <div className="ml-4 flex items-center">
            <span className="text-green-600 font-semibold mr-3">Completed</span>
            <Button onClick={() => onViewResults(file)}>
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
      <div className='ml-auto'>
        {renderMatchingControls()}
      </div>
    </li>
  );
};

export default FileListItem;