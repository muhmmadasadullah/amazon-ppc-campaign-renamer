// Mock data for testing the application
export const mockCampaigns = [
  {
    id: '1234567890',
    originalName: 'SP - Manual - Targeting | PreWorkout | Offense | KT | Exact | B0D9WW4LQZ',
    newName: '',
    campaignType: 'SP',
    state: 'enabled',
    targetingType: 'Manual',
    advertisedAsins: ['B0D9WW4LQZ'],
    keywords: [
      { text: 'pre workout supplement', matchType: 'exact', state: 'enabled' }
    ],
    productTargets: [],
    placementModifiers: [
      { placement: 'Top of search (first page)', percentage: 25 }
    ],
    autoTargetGroups: [],
    matchTypes: new Set(['exact']),
    badges: new Set(['TOS']),
    isAuto: false,
    isSKC: true,
    isDefensive: false,
    hasBrandedKeywords: false,
    hasPlacementModifiers: true,
    originalData: {}
  },
  {
    id: '2345678901',
    originalName: 'SP - Auto | TongkatAli | Offense | B0CHN8Q3J4',
    newName: '',
    campaignType: 'SP',
    state: 'enabled',
    targetingType: 'Auto',
    advertisedAsins: ['B0CHN8Q3J4'],
    keywords: [],
    productTargets: [],
    placementModifiers: [],
    autoTargetGroups: ['close match', 'loose match', 'substitutes', 'complements'],
    matchTypes: new Set(),
    badges: new Set(),
    isAuto: true,
    isSKC: false,
    isDefensive: false,
    hasBrandedKeywords: false,
    hasPlacementModifiers: false,
    originalData: {}
  },
  {
    id: '3456789012',
    originalName: 'SBV | Offense | KT | Phrase | TongkatAli | B0CHN8Q3J4',
    newName: '',
    campaignType: 'SBV',
    state: 'enabled',
    targetingType: 'Manual',
    advertisedAsins: ['B0CHN8Q3J4'],
    keywords: [
      { text: 'tongkat ali extract', matchType: 'phrase', state: 'enabled' },
      { text: 'natural testosterone booster', matchType: 'phrase', state: 'enabled' }
    ],
    productTargets: [],
    placementModifiers: [],
    autoTargetGroups: [],
    matchTypes: new Set(['phrase']),
    badges: new Set(),
    isAuto: false,
    isSKC: false,
    isDefensive: false,
    hasBrandedKeywords: false,
    hasPlacementModifiers: false,
    originalData: {}
  }
];

export const mockTemplate = {
  'B0D9WW4LQZ': 'PreWorkout',
  'B0CHN8Q3J4': 'TongkatAli'
};

export const mockStats = {
  total: 3,
  sp: 2,
  sb: 0,
  sd: 0,
  sbv: 1,
  auto: 1,
  manual: 2,
  skc: 1,
  defensive: 0,
  advertisedAsins: ['B0D9WW4LQZ', 'B0CHN8Q3J4']
};