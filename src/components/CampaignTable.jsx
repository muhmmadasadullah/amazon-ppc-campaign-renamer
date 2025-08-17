import { useState, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

export function CampaignTable({ campaigns, onNameUpdate, charLimit }) {
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    if (!sortConfig.key) return campaigns;
    
    return [...campaigns].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      // Handle special cases
      if (sortConfig.key === 'badges') {
        aVal = Array.from(a.badges).join(', ');
        bVal = Array.from(b.badges).join(', ');
      } else if (sortConfig.key === 'matchTypes') {
        aVal = Array.from(a.matchTypes).join(', ');
        bVal = Array.from(b.matchTypes).join(', ');
      } else if (sortConfig.key === 'advertisedAsins') {
        aVal = a.advertisedAsins.join(', ');
        bVal = b.advertisedAsins.join(', ');
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [campaigns, sortConfig]);

  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleNameEdit = useCallback((campaignId, newName) => {
    onNameUpdate(campaignId, newName);
    setEditingId(null);
  }, [onNameUpdate]);

  const getStatusInfo = useCallback((campaign) => {
    const issues = [];
    const newNameLength = (campaign.newName || campaign.originalName).length;
    
    if (newNameLength > charLimit) {
      issues.push({ type: 'error', message: `Too long (${newNameLength}/${charLimit})` });
    } else if (newNameLength > charLimit * 0.9) {
      issues.push({ type: 'warning', message: `Near limit (${newNameLength}/${charLimit})` });
    }
    
    // Check for duplicates (simplified - in real implementation, this would check against all campaigns)
    const duplicates = sortedCampaigns.filter(c => 
      c.id !== campaign.id && 
      (c.newName || c.originalName) === (campaign.newName || campaign.originalName)
    );
    
    if (duplicates.length > 0) {
      issues.push({ type: 'error', message: 'Duplicate name' });
    }
    
    if (issues.length === 0) {
      return { type: 'success', message: 'OK' };
    }
    
    return issues[0]; // Return the first (most severe) issue
  }, [sortedCampaigns, charLimit]);

  const Badge = ({ badge }) => {
    const badgeClasses = {
      'SKC': 'badge-skc',
      'DEF': 'badge-def',
      'BKWS': 'badge-bkws',
      'TOS': 'badge-tos',
      'PP': 'badge-pp'
    };
    
    return (
      <span className={`badge ${badgeClasses[badge] || 'badge-neutral'}`}>
        {badge}
      </span>
    );
  };

  const EditableCell = ({ campaign, value, onSave }) => {
    const [tempValue, setTempValue] = useState(value);
    const isEditing = editingId === campaign.id;

    const handleSave = () => {
      onSave(campaign.id, tempValue);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setTempValue(value);
        setEditingId(null);
      }
    };

    if (isEditing) {
      return (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="input input-xs input-bordered w-full"
          autoFocus
        />
      );
    }

    return (
      <div
        className="editable cursor-pointer min-h-6 flex items-center"
        onClick={() => {
          setEditingId(campaign.id);
          setTempValue(value);
        }}
        title="Click to edit"
      >
        {value || <span className="text-gray-400 italic">Click to edit</span>}
      </div>
    );
  };

  const TableRow = ({ index, style }) => {
    const campaign = sortedCampaigns[index];
    const status = getStatusInfo(campaign);
    
    return (
      <div style={style} className="flex border-b border-base-300 hover:bg-base-200/50">
        {/* Select checkbox */}
        <div className="w-12 p-2 flex items-center justify-center">
          <input type="checkbox" className="checkbox checkbox-xs" />
        </div>
        
        {/* Campaign Type */}
        <div className="w-16 p-2 flex items-center">
          <span className={`badge badge-outline badge-sm ${
            campaign.campaignType === 'SP' ? 'badge-primary' :
            campaign.campaignType === 'SB' ? 'badge-secondary' :
            campaign.campaignType === 'SD' ? 'badge-accent' :
            'badge-neutral'
          }`}>
            {campaign.campaignType}
          </span>
        </div>
        
        {/* Original Name */}
        <div className="flex-1 min-w-0 p-2">
          <div className="truncate text-sm" title={campaign.originalName}>
            {campaign.originalName}
          </div>
        </div>
        
        {/* New Name */}
        <div className="flex-1 min-w-0 p-2">
          <EditableCell
            campaign={campaign}
            value={campaign.newName || campaign.originalName}
            onSave={handleNameEdit}
          />
        </div>
        
        {/* Match Types */}
        <div className="w-24 p-2">
          <div className="text-xs">
            {Array.from(campaign.matchTypes).map(type => (
              <span key={type} className="inline-block mr-1 mb-1 px-1 py-0.5 bg-base-200 rounded text-xs">
                {type.toUpperCase()}
              </span>
            ))}
            {campaign.isAuto && (
              <span className="inline-block mr-1 mb-1 px-1 py-0.5 bg-primary/20 text-primary rounded text-xs">
                AUTO
              </span>
            )}
          </div>
        </div>
        
        {/* Badges */}
        <div className="w-32 p-2">
          <div className="flex flex-wrap gap-1">
            {Array.from(campaign.badges).map(badge => (
              <Badge key={badge} badge={badge} />
            ))}
          </div>
        </div>
        
        {/* Advertised ASINs */}
        <div className="w-32 p-2">
          <div className="text-xs">
            {campaign.advertisedAsins.slice(0, 2).map(asin => (
              <div key={asin} className="truncate font-mono">
                {asin}
              </div>
            ))}
            {campaign.advertisedAsins.length > 2 && (
              <div className="text-xs text-base-content/60">
                +{campaign.advertisedAsins.length - 2} more
              </div>
            )}
          </div>
        </div>
        
        {/* Length */}
        <div className="w-16 p-2 text-center">
          <span className={`text-xs ${
            (campaign.newName || campaign.originalName).length > charLimit ? 'text-error' :
            (campaign.newName || campaign.originalName).length > charLimit * 0.9 ? 'text-warning' :
            'text-success'
          }`}>
            {(campaign.newName || campaign.originalName).length}
          </span>
        </div>
        
        {/* Status */}
        <div className="w-24 p-2">
          <span className={`text-xs ${
            status.type === 'success' ? 'text-success' :
            status.type === 'warning' ? 'text-warning' :
            'text-error'
          }`}>
            {status.message}
          </span>
        </div>
      </div>
    );
  };

  const SortableHeader = ({ label, sortKey, width = 'flex-1' }) => (
    <div 
      className={`${width} p-2 cursor-pointer hover:bg-base-300 flex items-center justify-between`}
      onClick={() => handleSort(sortKey)}
    >
      <span className="font-medium text-xs uppercase tracking-wider">
        {label}
      </span>
      {sortConfig.key === sortKey && (
        <svg 
          className={`w-4 h-4 transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`}
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="flex bg-base-200 border-b border-base-300 sticky top-0 z-10">
        <div className="w-12 p-2 text-center">
          <input type="checkbox" className="checkbox checkbox-xs" />
        </div>
        <SortableHeader label="Type" sortKey="campaignType" width="w-16" />
        <SortableHeader label="Original Name" sortKey="originalName" />
        <SortableHeader label="New Name" sortKey="newName" />
        <SortableHeader label="Match Types" sortKey="matchTypes" width="w-24" />
        <SortableHeader label="Badges" sortKey="badges" width="w-32" />
        <SortableHeader label="Advertised ASINs" sortKey="advertisedAsins" width="w-32" />
        <div className="w-16 p-2 text-center font-medium text-xs uppercase tracking-wider">
          Len
        </div>
        <div className="w-24 p-2 text-center font-medium text-xs uppercase tracking-wider">
          Status
        </div>
      </div>

      {/* Table Body - Virtualized */}
      <div className="h-96 overflow-auto">
        <List
          height={384}
          itemCount={sortedCampaigns.length}
          itemSize={56}
          width="100%"
        >
          {TableRow}
        </List>
      </div>

      {/* Table Footer */}
      <div className="bg-base-200 p-4 border-t border-base-300">
        <div className="flex justify-between items-center text-sm">
          <span>
            Showing {sortedCampaigns.length} of {campaigns.length} campaigns
          </span>
          <div className="flex gap-4">
            <span className="text-success">
              {sortedCampaigns.filter(c => getStatusInfo(c).type === 'success').length} OK
            </span>
            <span className="text-warning">
              {sortedCampaigns.filter(c => getStatusInfo(c).type === 'warning').length} Warnings
            </span>
            <span className="text-error">
              {sortedCampaigns.filter(c => getStatusInfo(c).type === 'error').length} Errors
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}