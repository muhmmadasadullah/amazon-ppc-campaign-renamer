import { useState, useCallback, useMemo, useRef } from 'react';

export function useCampaignData(filters) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const workerRef = useRef(null);
  const originalWorkbookRef = useRef(null);

  const loadCampaigns = useCallback(async (file) => {
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
            case 'PARSE_BULK_FILE_SUCCESS':
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
        type: 'PARSE_BULK_FILE',
        data: { file: fileBuffer }
      });
      
      // Wait for parsing to complete
      const result = await parsePromise;
      
      // Store the results
      setCampaigns(result.campaigns || []);
      originalWorkbookRef.current = result.originalWorkbook;
      
      // Terminate worker after use
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      
    } catch (err) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to parse the file. Please ensure it\'s a valid Amazon bulk operations file.');
      
      // Cleanup worker on error
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCampaignName = useCallback((campaignId, newName) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, newName, isManuallyEdited: true }
          : campaign
      )
    );
  }, []);

  const updateCampaigns = useCallback((updatedCampaigns) => {
    setCampaigns(updatedCampaigns);
  }, []);

  // Calculate stats from campaigns
  const stats = useMemo(() => {
    const stats = {
      total: campaigns.length,
      sp: 0,
      sb: 0,
      sd: 0,
      sbv: 0,
      auto: 0,
      manual: 0,
      skc: 0,
      defensive: 0,
      advertisedAsins: new Set()
    };
    
    campaigns.forEach(campaign => {
      switch (campaign.campaignType) {
        case 'SP':
          stats.sp++;
          break;
        case 'SB':
          stats.sb++;
          break;
        case 'SD':
          stats.sd++;
          break;
        case 'SBV':
          stats.sbv++;
          break;
      }
      
      if (campaign.isAuto) stats.auto++;
      else stats.manual++;
      
      if (campaign.isSKC) stats.skc++;
      if (campaign.isDefensive) stats.defensive++;
      
      campaign.advertisedAsins.forEach(asin => {
        if (asin) stats.advertisedAsins.add(asin);
      });
    });
    
    return {
      ...stats,
      advertisedAsins: Array.from(stats.advertisedAsins)
    };
  }, [campaigns]);

  // Filter campaigns based on current filters
  const filteredCampaigns = useMemo(() => {
    if (!campaigns.length) return [];
    
    return campaigns.filter(campaign => {
      // Campaign type filter
      if (filters.campaignType !== 'all' && 
          campaign.campaignType.toLowerCase() !== filters.campaignType.toLowerCase()) {
        return false;
      }
      
      // Match type filter
      if (filters.matchType !== 'all') {
        const matchType = filters.matchType.toLowerCase();
        
        if (matchType === 'auto' && !campaign.isAuto) return false;
        if (matchType === 'ex' && !campaign.matchTypes.has('exact')) return false;
        if (matchType === 'ph' && !campaign.matchTypes.has('phrase')) return false;
        if (matchType === 'br' && !campaign.matchTypes.has('broad')) return false;
        if (matchType === 'pat' && campaign.productTargets.length === 0) return false;
      }
      
      // Badge filter
      if (filters.badge !== 'all') {
        const badge = filters.badge.toUpperCase();
        if (!campaign.badges.has(badge)) return false;
      }
      
      // Advertised ASIN filter
      if (filters.advertisedAsin !== 'all') {
        if (!campaign.advertisedAsins.includes(filters.advertisedAsin)) return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesOriginal = campaign.originalName.toLowerCase().includes(searchTerm);
        const matchesNew = campaign.newName?.toLowerCase().includes(searchTerm);
        const matchesAsin = campaign.advertisedAsins.some(asin => 
          asin.toLowerCase().includes(searchTerm)
        );
        
        if (!matchesOriginal && !matchesNew && !matchesAsin) return false;
      }
      
      return true;
    });
  }, [campaigns, filters]);

  return {
    campaigns,
    loading,
    error,
    stats,
    filteredCampaigns,
    loadCampaigns,
    updateCampaignName,
    updateCampaigns,
    originalWorkbook: originalWorkbookRef.current
  };
}