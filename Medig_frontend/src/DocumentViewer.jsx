import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { File, ArrowLeft, X, AlertCircle } from 'lucide-react';

const DocumentViewer = () => {
  const { folderName } = useParams();
  const navigate = useNavigate();
  const patientDetails = JSON.parse(localStorage.getItem('patientDetails'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadError, setLoadError] = useState(false);
  
  const files = patientDetails.medicalDocuments[folderName] || [];

  const handleFileClick = (file) => {
    setLoadError(false);
    setSelectedFile(file);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const closeModal = () => {
    setSelectedFile(null);
    setLoadError(false);
  };

  // Transform Cloudinary URL to force PDF display
  const getPdfViewerUrl = (url) => {
    try {
      // Add fl_attachment flag to force display instead of download
      if (url.includes('cloudinary.com')) {
        // Split the URL at /upload/ and add fl_attachment
        const parts = url.split('/upload/');
        if (parts.length === 2) {
          return `${parts[0]}/upload/fl_attachment/${parts[1]}`;
        }
      }
      return url;
    } catch (error) {
      console.error('Error processing PDF URL:', error);
      return url;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-teal-50 to-teal-100">
      <div className="w-full h-full mx-auto p-4">
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="hover:bg-gray-700 p-1 rounded"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-lg font-medium">{folderName}</h2>
          </div>
          <button 
            onClick={handleBack}
            className="hover:bg-gray-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Files Grid */}
        <div className="bg-teal-50/80 p-6 rounded-b-lg min-h-[calc(100vh-8rem)]">
          <div className="grid grid-cols-4 gap-6">
            {files.map((file, index) => (
              <div
                key={index}
                className="group cursor-pointer"
                onClick={() => handleFileClick(file)}
              >
                {/* File Icon */}
                <div className="bg-white border-2 border-teal-200 hover:border-teal-300 transition-colors rounded-lg p-4 aspect-square flex flex-col items-center justify-center mb-2 shadow-sm hover:shadow-md">
                  <File 
                    size={32} 
                    className="text-teal-700 group-hover:text-teal-800 transition-colors mb-2" 
                  />
                  {/* File Name */}
                  <p className="text-sm text-center text-gray-700 font-medium break-words w-full">
                    {file.split('/').pop() || file}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {files.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <File size={48} className="mb-4" />
              <p>No files found in this folder</p>
            </div>
          )}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {selectedFile.split('/').pop() || selectedFile}
              </h3>
              <div className="flex gap-4 items-center">
                <a 
                  href={selectedFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Open in New Tab
                </a>
                <button 
                  onClick={closeModal}
                  className="hover:bg-gray-100 p-1 rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            {/* PDF Viewer */}
            <div className="flex-1 p-4 bg-gray-50">
              {loadError ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <AlertCircle size={48} className="mb-4 text-red-500" />
                  <p>Failed to load PDF. Please try opening in a new tab.</p>
                </div>
              ) : (
                <iframe
                  src={getPdfViewerUrl(selectedFile)}
                  className="w-full h-full rounded border bg-white"
                  title="PDF Viewer"
                  onError={() => setLoadError(true)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;