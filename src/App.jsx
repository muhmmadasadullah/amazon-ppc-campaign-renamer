import { useState, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { CampaignTable } from './components/CampaignTable';
import { ExportSection } from './components/ExportSection';
import { TemplateUpload } from './components/TemplateUpload';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ThemeToggle } from './components/ThemeToggle';
import { useCampaignData } from './hooks/useCampaignData';
import { useTemplateData } from './hooks/useTemplateData';
import { useNameGeneration } from './hooks/useNameGeneration';

function App() {
  const [step, setStep] = useState(1);
  const [platformType, setPlatformType] = useState('seller'); // seller or vendor
  const [brandTokens, setBrandTokens] = useState('');
  const [enforceShortNames, setEnforceShortNames] = useState(false);
  const [filters, setFilters] = useState({
    campaignType: 'all',
    matchType: 'all',
    badge: 'all',
    advertisedAsin: 'all',
    search: ''
  });

  const {
    campaigns,
    loading: campaignLoading,
    error: campaignError,
    stats,
    loadCampaigns,
    updateCampaignName,
    updateCampaigns,
    filteredCampaigns
  } = useCampaignData(filters);

  const {
    template,
    loading: templateLoading,
    loadTemplate
  } = useTemplateData();

  const {
    generateNames,
    validateNames,
    duplicateCount,
    lengthViolations
  } = useNameGeneration({
    campaigns,
    template,
    platformType,
    brandTokens,
    enforceShortNames
  });

  const handleFileUpload = useCallback(async (file) => {
    try {
      await loadCampaigns(file);
      setStep(2);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    }
  }, [loadCampaigns]);

  const handleTemplateUpload = useCallback(async (file) => {
    try {
      await loadTemplate(file);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }, [loadTemplate]);

  const handleGenerateNames = useCallback(() => {
    const updatedCampaigns = generateNames();
    updateCampaigns(updatedCampaigns);
    setStep(3);
  }, [generateNames, updateCampaigns]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const charLimit = platformType === 'vendor' ? 116 : 128;

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="bg-base-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-base-content">
                Amazon PPC Campaign Renamer
              </h1>
              <p className="text-sm text-base-content/70">
                Bulk rename campaigns using intelligent detection and templates
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Platform Type Selector */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Platform</span>
                </label>
                <select 
                  className="select select-sm select-bordered"
                  value={platformType}
                  onChange={(e) => setPlatformType(e.target.value)}
                >
                  <option value="seller">Seller (128 chars)</option>
                  <option value="vendor">Vendor (116 chars)</option>
                </select>
              </div>
              
              {/* Brand Tokens Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Brand Tokens</span>
                </label>
                <input
                  type="text"
                  className="input input-sm input-bordered w-48"
                  placeholder="brand1, brand2, etc."
                  value={brandTokens}
                  onChange={(e) => setBrandTokens(e.target.value)}
                />
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={step} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Step 1: File Upload */}
        {step >= 1 && (
          <section className="mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Step 1: Upload Bulk Operations File</h2>
                <FileUpload
                  onFileUpload={handleFileUpload}
                  loading={campaignLoading}
                  error={campaignError}
                />
              </div>
            </div>
          </section>
        )}

        {/* Template Upload (Optional) */}
        {step >= 2 && campaigns.length > 0 && (
          <section className="mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Product Naming Template (Optional)</h2>
                <TemplateUpload
                  onTemplateUpload={handleTemplateUpload}
                  loading={templateLoading}
                  template={template}
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 2: Dashboard and Filtering */}
        {step >= 2 && campaigns.length > 0 && (
          <section className="mb-8">
            <Dashboard
              stats={stats}
              filters={filters}
              onFilterChange={handleFilterChange}
              campaigns={campaigns}
            />
          </section>
        )}

        {/* Campaign Table */}
        {step >= 2 && campaigns.length > 0 && (
          <section className="mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title">Campaign Overview</h2>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={handleGenerateNames}
                      disabled={campaignLoading}
                    >
                      Generate Names
                    </button>
                  </div>
                </div>
                
                <CampaignTable
                  campaigns={filteredCampaigns}
                  onNameUpdate={updateCampaignName}
                  charLimit={charLimit}
                />
              </div>
            </div>
          </section>
        )}

        {/* Step 3: Export */}
        {step >= 3 && campaigns.length > 0 && (
          <section className="mb-8">
            <ExportSection
              campaigns={campaigns}
              stats={stats}
              duplicateCount={duplicateCount}
              lengthViolations={lengthViolations}
              charLimit={charLimit}
            />
          </section>
        )}

        {/* Settings Panel */}
        {step >= 2 && campaigns.length > 0 && (
          <section className="mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Advanced Settings</h2>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Enforce 50-character limit</span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={enforceShortNames}
                      onChange={(e) => setEnforceShortNames(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;