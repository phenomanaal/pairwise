'use client';  // Ensure this is a client-side component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadForm = ({fileType}) => {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMsg('');
      setMsgType('');
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
    } else if (msgType == "success") {
      router.push('/match-file')
    } else {
      setMsg('');
      setMsgType('');
      setLoading(true);
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
  
      try {
        const response = await fetch('http://localhost:3001/pairwise/file', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          setMsg('Upload Complete.');
          setMsgType('success');
          // TODO: adjust form to allow for more file uploads of external data files
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
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO: have the state field be filled in based on user profile. */}
      <p className="pb-6">Please provide a current {fileType} file for Fallaron.</p>

      <div className="mb-4">
        {fileType == "external" && (
          <select
          defaultValue={""}
            className="w-full font-sans text-base py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4">
              <option value="" disabled>Select Data Type</option>
              <option value="state-dept-corrections-felons-list">State Department of Corrections Felons List</option>
          </select>
        )}
        
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
          <input id="fileType" type="text" className="hidden" value={fileType} readOnly/>
          
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
        disabled={loading}
      >
        {loading ? 'Uploading...' : msgType === 'success' ? 'Continue' : 'Submit File'}
      </button>
    </form>
  );
};

export default UploadForm;
