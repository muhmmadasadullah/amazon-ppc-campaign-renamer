import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';

export function ExportSection({ campaigns, stats, duplicateCount, lengthViolations, charLimit }) {
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setExportError(null);
    
    try {
      // Create Web Worker for export
      const worker = new Worker('/excelParser.js');
      
      // Set up worker message handler
      const exportPromise = new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          const { type, data, error } = e.data;
          
          switch (type) {
            case 'EXPORT_FILE_SUCCESS':
              resolve(data);
              break;
            case 'ERROR':
              reject(new Error(error.message));
              break;
            default:
              break;
          }
        };
        
        worker.onerror = (error) => {
          reject(new Error(`Worker error: ${error.message}`));
        };
      });
      
      // Send campaigns to worker for export
      worker.postMessage({
        type: 'EXPORT_FILE',
        data: { 
          campaigns: campaigns.filter(c => c.newName), // Only export campaigns with new names
          originalWorkbook: null // We'll implement this later
        }
      });
      
      // Wait for export to complete
      const exportData = await exportPromise;
      
      // Create blob and trigger download
      const blob = new Blob([exportData], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `renamed-campaigns-${timestamp}.xlsx`;
      
      saveAs(blob, filename);
      
      // Cleanup worker
      worker.terminate();
      
    } catch (err) {
      console.error('Export error:', err);
      setExportError(err.message || 'Failed to export file');
    } finally {
      setExporting(false);
    }
  }, [campaigns]);

  const readyToExport = campaigns.filter(c => c.newName && c.newName !== c.originalName).length;
  const hasIssues = duplicateCount > 0 || lengthViolations > 0;

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Export Updated Campaign Names</h2>
        
        {/* Export Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-value text-primary text-lg">{readyToExport}</div>
            <div className="stat-title text-xs">Campaigns to Update</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className={`stat-value text-lg ${duplicateCount > 0 ? 'text-error' : 'text-success'}`}>
              {duplicateCount}
            </div>
            <div className="stat-title text-xs">Duplicate Names</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className={`stat-value text-lg ${lengthViolations > 0 ? 'text-error' : 'text-success'}`}>
              {lengthViolations}
            </div>
            <div className="stat-title text-xs">Length Violations</div>
          </div>
          
          <div className="stat bg-base-200 rounded-lg p-4">
            <div className="stat-value text-success text-lg">
              {readyToExport - duplicateCount - lengthViolations}
            </div>
            <div className="stat-title text-xs">Ready to Export</div>
          </div>
        </div>
        
        {/* Validation Status */}
        {hasIssues && (
          <div className="alert alert-warning mb-4">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Validation Issues Detected</h3>
              <div className="text-sm">
                {duplicateCount > 0 && <p>• {duplicateCount} campaigns have duplicate names</p>}
                {lengthViolations > 0 && <p>• {lengthViolations} campaigns exceed the {charLimit} character limit</p>}
                <p>Please review and fix these issues before exporting.</p>
              </div>
            </div>
          </div>
        )}
        
        {!hasIssues && readyToExport > 0 && (
          <div className="alert alert-success mb-4">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Ready to Export!</h3>
              <div className="text-sm">
                All {readyToExport} campaigns have valid new names and are ready for export.
              </div>
            </div>
          </div>
        )}
        
        {/* Export Error */}
        {exportError && (
          <div className="alert alert-error mb-4">
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
              <h3 className="font-bold">Export Failed</h3>
              <div className="text-sm">{exportError}</div>
            </div>
          </div>
        )}
        
        {/* Export Actions */}
        <div className="card-actions justify-between items-center">
          <div className="text-sm text-base-content/70">
            {readyToExport === 0 
              ? 'No campaigns to export. Generate names first.'
              : `${readyToExport} campaigns ready for export`
            }
          </div>
          
          <button
            className={`btn btn-primary ${exporting ? 'loading' : ''}`}
            onClick={handleExport}
            disabled={readyToExport === 0 || hasIssues || exporting}
          >
            {exporting ? 'Exporting...' : 'Download Updated File'}
          </button>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 prose prose-sm max-w-none">
          <h3>Next Steps:</h3>
          <ol>
            <li>Download the updated bulk operations file using the button above</li>
            <li>Go to your Amazon Ads console and navigate to Bulk Operations</li>
            <li>Upload the downloaded file to apply the new campaign names</li>
            <li>Review the upload results to ensure all names were updated successfully</li>
          </ol>
          
          <div className="alert alert-info mt-4">
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
              <h4 className="font-bold text-sm">Important Notes</h4>
              <div className="text-xs">
                <p>• The exported file contains only campaigns with updated names</p>
                <p>• All operations are set to "Update" to modify existing campaigns</p>
                <p>• Backup your original data before uploading to Amazon</p>
                <p>• The file format is fully compliant with Amazon's bulk operations requirements</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}