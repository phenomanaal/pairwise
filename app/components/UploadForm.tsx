'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import FileSelect from './ui/FileSelect';
import ConfirmationDialog from './ui/ConfirmationDialog';

const externalFileTypes = [
  {
    value: 'state-dept-corrections-felons-list',
    label: 'State Department of Corrections Felons List',
  },
  {
    value: 'dept-of-vital-stats-deceased-list',
    label: 'Department of Vital Statistics Deceased Persons List',
  },
  { value: 'change-of-address-record', label: 'Change of Address Record' },
  { value: 'other-voter-file', label: 'Other State Voter File' },
];

interface UploadFormProps {
  fileType: string;
}

const UploadForm = ({ fileType }: UploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [externalFileType, setExternalFileType] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setMsg('');
    setMsgType('');
  };

  const handleFinishUploading = () => {
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed: boolean) => {
    setShowConfirmation(false);
    if (confirmed) {
      router.push('/match-files');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMsg('Please select a file to upload');
      setMsgType('error');
      return;
    } else if (msgType === 'success') {
      router.push('/external-file');
      return;
    }

    setMsg('');
    setMsgType('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', fileType);

    if (fileType === 'external' && externalFileType) {
      formData.append('externalFileType', externalFileType);
    }

    try {
      const response = await fetch('http://localhost:3001/pairwise/file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setMsg('Upload Complete.');
        setMsgType('success');

        if (fileType !== 'external') {
          router.push('/external-file');
        }
      } else {
        const data = await response.json();
        setMsg(data.message || 'An error occurred. Please try again.');
        setMsgType('error');
      }
    } catch (error) {
      console.log(error);
      setMsg('An unexpected error occurred');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="pb-6">
        Please provide a current {fileType} file for Fallaron.
      </p>

      <div className="mb-4">
        {fileType === 'external' && (
          <select
            id="externalFileType"
            value={externalFileType}
            onChange={(e) => setExternalFileType(e.target.value)}
            className="w-full font-sans text-base py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
          >
            <option value="" disabled>
              Select Data Type
            </option>
            {externalFileTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        )}

        <FileSelect
          onFileChange={handleFileChange}
          selectedFileName={file?.name || null}
        />
      </div>

      {msg && (
        <p
          className={`text-sm mb-4 ${
            msgType === 'success' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {msg}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Uploading...' : 'Submit File'}
        </Button>

        {fileType === 'external' && (
          <Button onClick={handleFinishUploading} fullWidth>
            Finished Uploading External Files
          </Button>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        title="Are you ready to begin matching?"
        onConfirm={() => handleConfirmation(true)}
        onCancel={() => handleConfirmation(false)}
      />
    </form>
  );
};

export default UploadForm;
