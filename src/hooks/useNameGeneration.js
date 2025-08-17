import { useState, useCallback, useMemo } from 'react';

export function useNameGeneration({ campaigns, template, platformType, brandTokens, enforceShortNames }) {
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [lengthViolations, setLengthViolations] = useState(0);

  const charLimit = platformType === 'vendor' ? 116 : 128;
  const shortCharLimit = enforceShortNames ? 50 : charLimit;

  // Parse brand tokens
  const brandTokenList = useMemo(() => {
    if (!brandTokens) return [];
    return brandTokens.split(',').map(token => token.trim().toLowerCase()).filter(Boolean);
  }, [brandTokens]);

  const detectBrandedKeywords = useCallback((campaign) => {
    if (brandTokenList.length === 0) return false;
    
    return campaign.keywords.some(keyword => {
      const keywordText = keyword.text.toLowerCase();
      return brandTokenList.some(brandToken => keywordText.includes(brandToken));
    });
  }, [brandTokenList]);

  const detectDefensiveCampaign = useCallback((campaign) => {
    // Check for branded keywords
    const hasBrandedKeywords = detectBrandedKeywords(campaign);
    if (hasBrandedKeywords) return true;
    
    // Check for own ASIN targeting (simplified - would need full ASIN catalog)
    // For now, assume if campaign targets any of its advertised ASINs, it's defensive
    const targetsOwnAsin = campaign.productTargets.some(target => {
      return campaign.advertisedAsins.some(asin => 
        target.expression.includes(asin)
      );
    });
    
    return targetsOwnAsin;
  }, [detectBrandedKeywords]);

  const generateCampaignName = useCallback((campaign) => {
    const segments = [];
    
    // 1. Campaign Type Prefix
    switch (campaign.campaignType) {
      case 'SP':
        segments.push('SP');
        break;
      case 'SB':
        // Check if it's video (simplified detection)
        segments.push('SB-PC'); // Default to Product Collection
        break;
      case 'SD':
        segments.push('SD');
        break;
      case 'SBV':
        segments.push('SBV');
        break;
      default:
        segments.push(campaign.campaignType);
    }
    
    // 2. Targeting Type
    if (campaign.isAuto) {
      // Check for specific auto targeting groups
      if (campaign.autoTargetGroups.length === 1) {
        const group = campaign.autoTargetGroups[0];
        switch (group.toLowerCase()) {
          case 'close match':
            segments.push('AUTO-CM');
            break;
          case 'loose match':
            segments.push('AUTO-LM');
            break;
          case 'substitutes':
            segments.push('AUTO-SB');
            break;
          case 'complements':
            segments.push('AUTO-CP');
            break;
          default:
            segments.push('AUTO');
        }
      } else {
        segments.push('AUTO');
      }
    } else if (campaign.keywords.length > 0) {
      // Manual keyword targeting
      const matchTypes = Array.from(campaign.matchTypes);
      if (matchTypes.length === 1) {
        const matchType = matchTypes[0].toLowerCase();
        switch (matchType) {
          case 'exact':
            segments.push('EX');
            break;
          case 'phrase':
            segments.push('PH');
            break;
          case 'broad':
            segments.push('BR');
            break;
          default:
            segments.push(matchType.toUpperCase());
        }
      } else if (matchTypes.length > 1) {
        // Multiple match types - use the broadest
        if (matchTypes.includes('broad')) segments.push('BR');
        else if (matchTypes.includes('phrase')) segments.push('PH');
        else segments.push('EX');
      }
      
      // Add KW for Sponsored Brands if needed
      if (campaign.campaignType === 'SB') {
        const lastSegment = segments[segments.length - 1];
        segments[segments.length - 1] = `KW-${lastSegment}`;
      }
    } else if (campaign.productTargets.length > 0) {
      // Product targeting
      segments.push('PAT');
    }
    
    // 3. Product Identifier
    let productName = '';
    if (campaign.advertisedAsins.length > 0) {
      const primaryAsin = campaign.advertisedAsins[0];
      
      // Use template name if available
      if (template && template[primaryAsin]) {
        productName = template[primaryAsin];
      } else {
        // Fallback to ASIN
        productName = primaryAsin;
      }
      
      segments.push(productName);
    }
    
    // 4. Defensive tag
    if (detectDefensiveCampaign(campaign)) {
      segments.push('DEF');
    }
    
    // 5. Placement modifiers
    const placementTags = [];
    campaign.placementModifiers.forEach(modifier => {
      const placement = modifier.placement.toLowerCase();
      if (placement.includes('top of search')) {
        placementTags.push('TOS');
      } else if (placement.includes('product page')) {
        placementTags.push('PP');
      }
    });
    
    if (placementTags.length > 0) {
      segments.push(placementTags.join('+'));
    }
    
    // Join segments
    let newName = segments.join(' - ');
    
    // Truncate if necessary
    if (newName.length > shortCharLimit) {
      // Try to truncate product name first
      const productIndex = segments.findIndex(s => 
        s === productName || (template && Object.values(template).includes(s))
      );
      
      if (productIndex !== -1 && productName.length > 10) {
        const maxProductLength = Math.max(8, shortCharLimit - (newName.length - productName.length) - 5);
        segments[productIndex] = productName.substring(0, maxProductLength) + '...';
        newName = segments.join(' - ');
      }
      
      // If still too long, truncate from the end
      if (newName.length > shortCharLimit) {
        newName = newName.substring(0, shortCharLimit - 3) + '...';
      }
    }
    
    return newName;
  }, [template, detectDefensiveCampaign, shortCharLimit]);

  const generateNames = useCallback(() => {
    const updatedCampaigns = campaigns.map(campaign => {
      // Skip if manually edited
      if (campaign.isManuallyEdited) return campaign;
      
      // Generate new name
      const newName = generateCampaignName(campaign);
      
      // Update campaign badges based on detection
      const updatedBadges = new Set(campaign.badges);
      
      if (campaign.isSKC) updatedBadges.add('SKC');
      if (detectDefensiveCampaign(campaign)) {
        updatedBadges.add('DEF');
        campaign.isDefensive = true;
      }
      if (detectBrandedKeywords(campaign)) {
        updatedBadges.add('BKWS');
        campaign.hasBrandedKeywords = true;
      }
      
      // Add placement badges
      campaign.placementModifiers.forEach(modifier => {
        const placement = modifier.placement.toLowerCase();
        if (placement.includes('top of search')) {
          updatedBadges.add('TOS');
        } else if (placement.includes('product page')) {
          updatedBadges.add('PP');
        }
      });
      
      return {
        ...campaign,
        newName,
        badges: updatedBadges
      };
    });
    
    // Check for duplicates and resolve them
    const nameCount = new Map();
    const resolvedCampaigns = [];
    
    updatedCampaigns.forEach(campaign => {
      let finalName = campaign.newName;
      const baseName = finalName;
      
      // Check if name already exists
      if (nameCount.has(baseName)) {
        const count = nameCount.get(baseName) + 1;
        nameCount.set(baseName, count);
        finalName = `${baseName} - V${count}`;
      } else {
        nameCount.set(baseName, 1);
      }
      
      resolvedCampaigns.push({
        ...campaign,
        newName: finalName
      });
    });
    
    // Calculate stats
    const duplicates = Array.from(nameCount.values()).filter(count => count > 1).length;
    const violations = resolvedCampaigns.filter(c => c.newName.length > charLimit).length;
    
    setDuplicateCount(duplicates);
    setLengthViolations(violations);
    
    return resolvedCampaigns;
  }, [campaigns, generateCampaignName, detectDefensiveCampaign, detectBrandedKeywords, charLimit]);

  const validateNames = useCallback((campaignsToValidate) => {
    const issues = [];
    const nameSet = new Set();
    
    campaignsToValidate.forEach(campaign => {
      const name = campaign.newName || campaign.originalName;
      
      // Check length
      if (name.length > charLimit) {
        issues.push({
          campaignId: campaign.id,
          type: 'length',
          message: `Campaign name exceeds ${charLimit} character limit`
        });
      }
      
      // Check duplicates
      if (nameSet.has(name)) {
        issues.push({
          campaignId: campaign.id,
          type: 'duplicate',
          message: 'Duplicate campaign name detected'
        });
      } else {
        nameSet.add(name);
      }
      
      // Check empty names
      if (!name || name.trim() === '') {
        issues.push({
          campaignId: campaign.id,
          type: 'empty',
          message: 'Campaign name cannot be empty'
        });
      }
    });
    
    return issues;
  }, [charLimit]);

  return {
    generateNames,
    validateNames,
    duplicateCount,
    lengthViolations,
    generateCampaignName
  };
}