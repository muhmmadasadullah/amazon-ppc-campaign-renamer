export function ProgressIndicator({ currentStep }) {
  const steps = [
    { number: 1, title: 'Upload File', description: 'Upload your Amazon bulk operations file' },
    { number: 2, title: 'Review & Configure', description: 'Review campaigns and apply filters' },
    { number: 3, title: 'Export', description: 'Download the updated bulk file' }
  ];

  return (
    <div className="bg-base-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${currentStep > step.number
                      ? 'bg-success border-success text-success-content'
                      : currentStep === step.number
                      ? 'bg-primary border-primary text-primary-content'
                      : 'bg-base-100 border-base-300 text-base-content'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{step.number}</span>
                  )}
                </div>
                
                {/* Step Info */}
                <div className="ml-3 hidden sm:block">
                  <p
                    className={`
                      text-sm font-medium
                      ${currentStep >= step.number
                        ? 'text-base-content'
                        : 'text-base-content/50'
                      }
                    `}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-base-content/60">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    w-16 h-0.5 mx-4
                    ${currentStep > step.number
                      ? 'bg-success'
                      : 'bg-base-300'
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}