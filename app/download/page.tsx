'use client';
import ProtectedRoute from '../components/ProtectedRoute';


export default function DownloadPage() {


  return (
    <ProtectedRoute>
      <div>
        download
      </div>
    </ProtectedRoute>
  );
}