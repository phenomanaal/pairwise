'use client';

import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import FileSelect from '../components/ui/FileSelect';

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

export default function ExternalFilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [externalFileType, setExternalFileType] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const router = useRouter();

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setMsg('');
    setMsgType('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMsg('Please select a file to upload');
      setMsgType('error');
      return;
    }

    if (!externalFileType) {
      setMsg('Please select a data type');
      setMsgType('error');
      return;
    }

    setMsg('');
    setMsgType('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'external');
    formData.append('externalFileType', externalFileType);

    try {
      const response = await fetch('http://localhost:3001/pairwise/file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setUploadSuccess(true);
        setMsg('Upload Successful');
        setMsgType('success');
        setUploadedFiles([...uploadedFiles, externalFileType]);
      } else {
        await response.json();
        setMsg(`The ${externalFileType} file uploaded was TBD.`);
        setMsgType('error');
      }
    } catch (error) {
      console.log(error);
      setMsg(`The ${externalFileType} file uploaded was TBD.`);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAnother = () => {
    setFile(null);
    setExternalFileType('');
    setMsg('');
    setMsgType('');
    setUploadSuccess(false);
  };

  const handleContinueToMatching = () => {
    router.push('/match-files');
  };

  const handleRetry = () => {
    setMsg('');
    setMsgType('');
    setUploadSuccess(false);
  };

  if (msgType === 'error' && !uploadSuccess) {
    return (
      <ProtectedRoute>
        <div>
          <Navbar />
          <Box
            sections={[
              {
                title: <span className="text-red-500">Error Uploading External File</span>,
                children: (
                  <div>
                    <p className="pb-4">{msg}</p>
                    <p className="pb-6">
                      Please return to the upload to retry with a valid {externalFileType} file.
                    </p>
                    <Button onClick={handleRetry} fullWidth>
                      Retry
                    </Button>
                  </div>
                ),
              },
            ]}
            width="md"
            showProgress={true}
          />
        </div>
      </ProtectedRoute>
    );
  }

  if (uploadSuccess) {
    return (
      <ProtectedRoute>
        <div>
          <Navbar />
          <Box
            sections={[
              {
                title: 'Upload Successful',
                children: (
                  <div>
                    <p className="pb-4">Successful upload of your {externalFileType} file.</p>
                    <p className="pb-4">Statistics string shows some stats about the file.</p>
                    <p className="pb-6">
                      You can now upload another external file. If you&apos;ve uploaded all the files that you need for the current list matching, you can continue to the next step.
                    </p>
                    <div className="flex flex-col gap-4">
                      <Button onClick={handleUploadAnother} fullWidth>
                        Upload Another File
                      </Button>
                      <Button onClick={handleContinueToMatching} fullWidth>
                        Continue to Matching
                      </Button>
                    </div>
                  </div>
                ),
              },
            ]}
            width="md"
            showProgress={true}
          />
        </div>
      </ProtectedRoute>
    );
  }

  const sections = [
    {
      title: 'Upload External Files',
      children: (
        <div>
          <p className="pb-6">
            Please provide a file with data to match against the voter data.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Data Type</label>
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
                  <option key={type.value} value={type.value} disabled={uploadedFiles.includes(type.value)}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
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

            <Button type="submit" disabled={loading} fullWidth>
              {loading ? 'Uploading...' : 'Submit File'}
            </Button>
          </form>

          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Uploaded Files:</h3>
              <div className="space-y-2">
                <div className="p-2 bg-gray-100 rounded">
                  <strong>Voter File:</strong> voter-file.csv
                </div>
                {uploadedFiles.map((fileType, index) => (
                  <div key={index} className="p-2 bg-gray-100 rounded">
                    <strong>{externalFileTypes.find(t => t.value === fileType)?.label}:</strong> {fileType}.csv
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button onClick={handleContinueToMatching} fullWidth>
                  Continue to Matching
                </Button>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <Box sections={sections} width="md" showProgress={true} />
      </div>
    </ProtectedRoute>
  );
}
