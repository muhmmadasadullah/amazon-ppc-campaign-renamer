import { useState, useCallback, useRef } from 'react';

export function FileUpload({ onFileUpload, loading, error }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => 
      f.name.endsWith('.xlsx') || 
      f.name.endsWith('.xls') || 
      f.name.endsWith('.csv')
    );
    
    if (file) {
      handleFileSelect(file);
    } else {
      alert('Please upload a valid Excel file (.xlsx, .xls) or CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    // Validate file size (max 120MB)
    const maxSize = 120 * 1024 * 1024; // 120MB in bytes
    if (file.size > maxSize) {
      alert('File size exceeds 120MB limit. Please use a smaller file.');
      return;
    }
    
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    if (!validTypes.includes(file.type) && 
        !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }
    
    onFileUpload(file);
  }, [onFileUpload]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleChooseFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {loading ? (
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-lg font-medium">Processing file...</p>
            <p className="text-sm text-base-content/70">
              This may take a moment for large files
            </p>
            {uploadProgress > 0 && (
              <div className="progress-bar mt-4 max-w-md mx-auto">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-base-content/40"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-4">
              <p className="text-lg font-medium">
                Drop your Amazon bulk operations file here
              </p>
              <p className="text-sm text-base-content/70 mt-1">
                or{' '}
                <button
                  type="button"
                  className="link link-primary"
                  onClick={handleChooseFile}
                >
                  choose a file
                </button>
              </p>
              <p className="text-xs text-base-content/50 mt-2">
                Supports .xlsx, .xls, and .csv files up to 120MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h3 className="font-bold">File Processing Error</h3>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}

      {/* File Format Information */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Supported File Types</h3>
          <div className="text-xs">
            <p>• Amazon Sponsored Products bulk operations files</p>
            <p>• Amazon Sponsored Brands bulk operations files</p>
            <p>• Amazon Sponsored Display bulk operations files</p>
            <p>• Multi-sheet Excel files with separate campaign types</p>
          </div>
        </div>
      </div>
    </div>
  );
}