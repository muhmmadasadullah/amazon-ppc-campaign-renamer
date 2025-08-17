import { useCallback, useRef } from 'react';

export function TemplateUpload({ onTemplateUpload, loading, template }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
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
    
    onTemplateUpload(file);
  }, [onTemplateUpload]);

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
      {!template ? (
        <div className="text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {loading ? (
            <div>
              <div className="spinner mx-auto mb-4"></div>
              <p className="text-sm">Processing template...</p>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-8 w-8 text-base-content/40 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm text-base-content/70 mb-4">
                Upload a product naming template to use custom product names in campaign names
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleChooseFile}
              >
                Choose Template File
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-base-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Template Loaded</h3>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => fileInputRef.current?.click()}
            >
              Change
            </button>
          </div>
          
          <div className="text-sm text-base-content/70">
            <p>Found {Object.keys(template).length} product mappings</p>
            
            {/* Preview first few entries */}
            <div className="mt-3 max-h-32 overflow-y-auto">
              <div className="space-y-1">
                {Object.entries(template).slice(0, 5).map(([asin, name]) => (
                  <div key={asin} className="flex justify-between text-xs">
                    <span className="font-mono">{asin}</span>
                    <span className="text-right truncate ml-2">{name}</span>
                  </div>
                ))}
                {Object.keys(template).length > 5 && (
                  <div className="text-xs text-center text-base-content/50 mt-2">
                    ...and {Object.keys(template).length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}
      
      {/* Template Format Information */}
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
          <h3 className="font-bold text-sm">Expected Template Format</h3>
          <div className="text-xs mt-1">
            <p>• Column 1: ASIN (product identifier)</p>
            <p>• Column 2: Your Product Name (custom short name for campaigns)</p>
            <p>• Additional columns are ignored</p>
            <p>• First row should contain headers</p>
          </div>
        </div>
      </div>
    </div>
  );
}