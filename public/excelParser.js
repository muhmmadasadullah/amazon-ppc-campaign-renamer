// Import XLSX differently for web worker
importScripts('https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js');

// Web Worker for parsing Excel files
self.onmessage = async function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'PARSE_BULK_FILE':
        const campaigns = await parseBulkFile(data.file);
        self.postMessage({
          type: 'PARSE_BULK_FILE_SUCCESS',
          data: campaigns
        });
        break;
        
      case 'PARSE_TEMPLATE_FILE':
        const template = await parseTemplateFile(data.file);
        self.postMessage({
          type: 'PARSE_TEMPLATE_FILE_SUCCESS',
          data: template
        });
        break;
        
      case 'EXPORT_FILE':
        const exportData = await exportFile(data.campaigns, data.originalWorkbook);
        self.postMessage({
          type: 'EXPORT_FILE_SUCCESS',
          data: exportData
        });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: {
        message: error.message,
        stack: error.stack
      }
    });
  }
};

async function parseBulkFile(fileBuffer) {
  // Read the Excel file with memory-optimized settings
  const workbook = XLSX.read(fileBuffer, {
    type: 'array',
    dense: true,
    cellDates: true,
    cellNF: false,
    cellText: false
  });
  
  const campaigns = new Map();
  const sheets = workbook.SheetNames;
  
  // Process each sheet (SP, SB, SD campaigns)
  for (const sheetName of sheets) {
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) continue;
    
    // Convert to JSON with header normalization
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: '',
      raw: false
    });
    
    if (jsonData.length < 2) continue; // Skip empty sheets
    
    const headers = normalizeHeaders(jsonData[0]);
    const rows = jsonData.slice(1);
    
    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index] || '';
      });
      
      // Only process enabled campaigns and their components
      if (rowData.state && rowData.state.toLowerCase() === 'paused') continue;
      if (rowData.state && rowData.state.toLowerCase() === 'archived') continue;
      
      // Process campaign entities
      if (rowData.entityType === 'Campaign' || 
          (rowData.campaignId && !campaigns.has(rowData.campaignId))) {
        
        const campaign = createCampaignObject(rowData, sheetName);
        campaigns.set(campaign.id, campaign);
      }
      
      // Add targeting information to existing campaigns
      if (rowData.campaignId && campaigns.has(rowData.campaignId)) {
        const campaign = campaigns.get(rowData.campaignId);
        addTargetingInfo(campaign, rowData);
      }
    }
  }
  
  // Convert map to array and perform final processing
  const campaignArray = Array.from(campaigns.values());
  
  // Detect campaign attributes
  campaignArray.forEach(campaign => {
    detectCampaignAttributes(campaign);
  });
  
  return {
    campaigns: campaignArray,
    originalWorkbook: workbook,
    stats: calculateStats(campaignArray)
  };
}

function normalizeHeaders(headers) {
  return headers.map(header => {
    if (!header) return '';
    
    const normalized = header.toString().toLowerCase().trim();
    
    // Map common variations
    const headerMap = {
      'campaign name': 'campaignName',
      'campaign id': 'campaignId',
      'campaign': 'campaignName',
      'entity type': 'entityType',
      'operation': 'operation',
      'campaign state': 'state',
      'state': 'state',
      'product': 'product',
      'campaign type': 'campaignType',
      'targeting type': 'targetingType',
      'match type': 'matchType', 
      'keyword text': 'keywordText',
      'keyword': 'keywordText',
      'product targeting expression': 'productTargetingExpression',
      'placement': 'placement',
      'percentage': 'percentage',
      'bid': 'bid',
      'advertised asin': 'advertisedAsin',
      'asin': 'advertisedAsin',
      'ad group name': 'adGroupName',
      'ad group id': 'adGroupId'
    };
    
    return headerMap[normalized] || normalized.replace(/\s+/g, '');
  });
}

function createCampaignObject(rowData, sheetName) {
  // Determine campaign type from sheet name or product column
  let campaignType = 'SP'; // Default
  
  if (sheetName.toLowerCase().includes('sponsored brands')) {
    campaignType = 'SB';
  } else if (sheetName.toLowerCase().includes('sponsored display')) {
    campaignType = 'SD';
  } else if (rowData.product) {
    const product = rowData.product.toLowerCase();
    if (product.includes('sponsored brands')) {
      campaignType = 'SB';
    } else if (product.includes('sponsored display')) {
      campaignType = 'SD';
    }
  }
  
  return {
    id: rowData.campaignId || generateId(),
    originalName: rowData.campaignName || '',
    newName: '', // Will be generated later
    campaignType,
    state: rowData.state || 'enabled',
    targetingType: rowData.targetingType || '',
    advertisedAsins: [],
    keywords: [],
    productTargets: [],
    placementModifiers: [],
    autoTargetGroups: [],
    matchTypes: new Set(),
    badges: new Set(),
    
    // Detection flags
    isAuto: false,
    isSKC: false,
    isDefensive: false,
    hasBrandedKeywords: false,
    hasPlacementModifiers: false,
    
    // Original row data for reference
    originalData: { ...rowData }
  };
}

function addTargetingInfo(campaign, rowData) {
  // Add keyword information
  if (rowData.keywordText && rowData.keywordText.trim()) {
    campaign.keywords.push({
      text: rowData.keywordText.trim(),
      matchType: rowData.matchType || '',
      state: rowData.state || 'enabled'
    });
    
    if (rowData.matchType) {
      campaign.matchTypes.add(rowData.matchType.toLowerCase());
    }
  }
  
  // Add product targeting information
  if (rowData.productTargetingExpression && rowData.productTargetingExpression.trim()) {
    campaign.productTargets.push({
      expression: rowData.productTargetingExpression.trim(),
      state: rowData.state || 'enabled'
    });
  }
  
  // Add placement modifiers
  if (rowData.placement && rowData.percentage) {
    const percentage = parseFloat(rowData.percentage);
    if (!isNaN(percentage) && percentage > 0) {
      campaign.placementModifiers.push({
        placement: rowData.placement,
        percentage: percentage
      });
    }
  }
  
  // Add advertised ASIN information
  if ((rowData.entityType === 'Product Ad' || rowData.entityType === 'Ad') && 
      rowData.advertisedAsin && rowData.advertisedAsin.trim()) {
    const asin = rowData.advertisedAsin.trim();
    if (!campaign.advertisedAsins.includes(asin)) {
      campaign.advertisedAsins.push(asin);
    }
  }
  
  // Detect auto targeting groups
  if (rowData.targetingType && rowData.targetingType.toLowerCase().includes('auto')) {
    campaign.isAuto = true;
    // Add auto group detection logic here if needed
  }
}

function detectCampaignAttributes(campaign) {
  // Detect if campaign is auto targeting
  campaign.isAuto = campaign.targetingType.toLowerCase().includes('auto') ||
                   campaign.keywords.length === 0 && campaign.productTargets.length === 0;
  
  // Detect Single Keyword Campaign (SKC)
  const enabledTargets = campaign.keywords.filter(k => k.state !== 'paused' && k.state !== 'archived');
  campaign.isSKC = enabledTargets.length === 1 && !campaign.isAuto;
  
  // Detect placement modifiers
  campaign.hasPlacementModifiers = campaign.placementModifiers.length > 0;
  
  // Add badges based on detection
  if (campaign.isSKC) campaign.badges.add('SKC');
  if (campaign.isDefensive) campaign.badges.add('DEF');
  if (campaign.hasBrandedKeywords) campaign.badges.add('BKWS');
  if (campaign.hasPlacementModifiers) {
    const hasToS = campaign.placementModifiers.some(p => 
      p.placement.toLowerCase().includes('top of search'));
    const hasPP = campaign.placementModifiers.some(p => 
      p.placement.toLowerCase().includes('product page'));
    
    if (hasToS) campaign.badges.add('TOS');
    if (hasPP) campaign.badges.add('PP');
  }
}

function calculateStats(campaigns) {
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
}

async function parseTemplateFile(fileBuffer) {
  const workbook = XLSX.read(fileBuffer, {
    type: 'array',
    dense: true
  });
  
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!worksheet) throw new Error('Template file is empty');
  
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (jsonData.length < 2) throw new Error('Template file has no data');
  
  const headers = jsonData[0].map(h => h?.toString().toLowerCase().trim());
  const asinIndex = headers.findIndex(h => h.includes('asin'));
  const nameIndex = headers.findIndex(h => h.includes('product name') || h.includes('your product'));
  
  if (asinIndex === -1) throw new Error('Template file missing ASIN column');
  if (nameIndex === -1) throw new Error('Template file missing product name column');
  
  const template = {};
  
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (row && row[asinIndex] && row[nameIndex]) {
      const asin = row[asinIndex].toString().trim();
      const name = row[nameIndex].toString().trim();
      if (asin && name) {
        template[asin] = name;
      }
    }
  }
  
  return template;
}

async function exportFile(campaigns, originalWorkbook) {
  // Create updated campaigns sheet
  const campaignData = campaigns.map(campaign => ({
    'Campaign ID': campaign.id,
    'Campaign Name': campaign.newName || campaign.originalName,
    'Operation': 'Update',
    'Campaign Type': campaign.campaignType,
    'Targeting Type': campaign.targetingType,
    'State': campaign.state
    // Add other required fields as needed...
  }));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(campaignData);
  XLSX.utils.book_append_sheet(wb, ws, 'Updated Campaigns');
  
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}