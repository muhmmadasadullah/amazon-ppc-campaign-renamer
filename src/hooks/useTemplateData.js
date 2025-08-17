import { useState, useCallback, useRef } from 'react';

export function useTemplateData() {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);

  const loadTemplate = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    
    try {
      // Create Web Worker for parsing
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      
      // Create worker from public folder
      workerRef.current = new Worker('/excelParser.js');
      
      // Convert file to ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Set up worker message handler
      const parsePromise = new Promise((resolve, reject) => {
        workerRef.current.onmessage = (e) => {
          const { type, data, error } = e.data;
          
          switch (type) {
            case 'PARSE_TEMPLATE_FILE_SUCCESS':
              resolve(data);
              break;
            case 'ERROR':
              reject(new Error(error.message));
              break;
            default:
              break;
          }
        };
        
        workerRef.current.onerror = (error) => {
          reject(new Error(`Worker error: ${error.message}`));
        };
      });
      
      // Send file to worker for parsing
      workerRef.current.postMessage({
        type: 'PARSE_TEMPLATE_FILE',
        data: { file: fileBuffer }
      });
      
      // Wait for parsing to complete
      const result = await parsePromise;
      
      // Store the template
      setTemplate(result);
      
      // Terminate worker after use
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
    } catch (err) {
      console.error('Error loading template:', err);
      setError(err.message || 'Failed to parse the template file.');
      
      // Cleanup worker on error
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    template,
    loading,
    error,
    loadTemplate
  };
}