'use client';

import Box from '@/app/components/Box';
import Navbar from '@/app/components/Navbar';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';
import FileSelect from '../components/ui/FileSelect';

export default function VoterFilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
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

    setMsg('');
    setMsgType('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'voter');

    try {
      const response = await fetch('http://localhost:3001/pairwise/file', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        setUploadComplete(true);
        setMsg('Upload Complete');
        setMsgType('success');
      } else {
        await response.json();
        setMsg('Voter file error TBD. Please retry with a valid voter file.');
        setMsgType('error');
      }
    } catch (error) {
      console.log(error);
      setMsg('Voter file error TBD. Please retry with a valid voter file.');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/external-file');
  };

  if (uploadComplete) {
    return (
      <ProtectedRoute>
        <div>
          <Navbar />
          <Box
            sections={[
              {
                title: 'Upload Complete',
                children: (
                  <div>
                    <p className="pb-4">Voter file information (e.g. stats)</p>
                    <p className="pb-6">
                      You are now ready to continue to upload external files that will each be used for PairWise comparison with the voter file.
                    </p>
                    <Button onClick={handleContinue} fullWidth>
                      Continue
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

  const sections = [
    {
      title: 'Voter File Upload',
      children: (
        <form onSubmit={handleSubmit}>
          <p className="pb-6">
            Please provide a current voter file for Farallon.
          </p>

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