'use client';  // Ensure this is a client-side component

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const UploadForm = ({fileType}) => {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error' | ''>('');
  const [loading, setLoading] = useState(false);
  const [externalFileType, setExternalFileType] = useState('');
  const router = useRouter();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMsg('');
      setMsgType('');
    }
  };

  const handleExternalFileTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExternalFileType(e.target.value);
  };

  const handleFinishUploading = () => {
    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const handleConfirmation = (confirmed: boolean) => {
    setShowConfirmation(false);
    if (confirmed) {
      // Redirect to the match-file page if confirmed
      router.push('/match-files');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMsg('Please select a file to upload');
      setMsgType('error');
      return;
    } else if (msgType == "success") {
      router.push('/external-file')
    } else {
      setMsg('');
      setMsgType('');
      setLoading(true);
  
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      
      if (fileType === "external" && externalFileType) {
        formData.append('externalFileType', externalFileType);
      }
  
      try {
        const response = await fetch('http://localhost:3001/pairwise/file', {
          method: 'POST',
          body: formData,
        });
  
        if (response.ok) {
          setMsg('Upload Complete.');
          setMsgType('success');
          
          // Maintain the original behavior - route to /external-file on success
          if (fileType !== "external") {
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
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO: have the state field be filled in based on user profile. */}
      <p className="pb-6">Please provide a current {fileType} file for Fallaron.</p>

      <div className="mb-4">
        {fileType == "external" && (
          <select
            id="externalFileType"
            value={externalFileType}
            onChange={handleExternalFileTypeChange}
            className="w-full font-sans text-base py-2 px-3 border border-gray-300 rounded-md bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4">
              <option value="" disabled>Select Data Type</option>
              <option value="state-dept-corrections-felons-list">State Department of Corrections Felons List</option>
              <option value="dept-of-vital-stats-deceased-list">Department of Vital Statistics Deceased Persons List</option>
              <option value="change-of-address-record">Change of Address Record</option>
              <option value="other-voter-file">Other State Voter File</option>
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

      <div className="flex flex-col gap-4">
        <button
          type="submit"
          className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Submit File'}
        </button>
        
        {fileType === "external" && (
          <button
            type="button"
            onClick={handleFinishUploading}
            className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            >
            Finished Uploading External Files
          </button>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium mb-4">Are you ready to begin matching?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default UploadForm;