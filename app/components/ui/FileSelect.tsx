// components/ui/FileSelect.tsx
'use client';
import Button from './Button';

interface FileSelectProps {
  onFileChange: (file: File) => void;
  selectedFileName: string | null;
}

const FileSelect = ({ onFileChange, selectedFileName }: FileSelectProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  return (
    <div className="flex items-center gap-4 mt-1">
      <Button
        onClick={() => document.getElementById('file')?.click()}
      >
        Choose File
      </Button>

      <input
        id="file"
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
      
      <span className="text-sm text-gray-500">
        {selectedFileName || 'No file selected'}
      </span>
    </div>
  );
};

export default FileSelect;