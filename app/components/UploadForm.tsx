'use client';  // Ensure this is a client-side component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  //onst router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMsg('');  // Clear any previous msg
      setMsgType('');  // Clear message type
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // some logic in here that tests if the file has been submitted (likely with msgType variable)
    // then if it's clicked, either redirect to external file upload, or keep adding more files? not sure
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

    try {
      const response = await fetch('http://localhost:4000/pairwise/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMsg('Upload Complete.');
        setMsgType('success');
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
      <p className="pb-6">Please provide a current voter file for __state__.</p>

      <div className="mb-4">
        <div className="flex items-center gap-4 mt-1">
          <button
            type="button"
            onClick={() => document.getElementById('file')?.click()}
            className="py-2 px-4 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Choose File
          </button>

          <input
            id="file"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          
          <span className="text-sm text-gray-500">{file ? file.name : 'No file selected'}</span>
        </div>
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

      <button
        type="submit"
        className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
        disabled={loading || !file}
      >
        {loading ? 'Uploading...' : msgType === 'success' ? 'Continue' : 'Submit File'}
      </button>
    </form>
  );
};

export default UploadForm;
