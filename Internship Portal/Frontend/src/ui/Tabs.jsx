import { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0, className = '', activeTab: controlledActiveTab, setActiveTab: controlledSetActiveTab }) => {
  const [internalTab, setInternalTab] = useState(defaultTab);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalTab;
  const setActiveTab = controlledSetActiveTab || setInternalTab;

  const handleTabClick = (index) => {
    const tab = tabs[index];
    if (tab.disabled) {
      return; // Don't change tab if disabled
    }
    setActiveTab(index);
  };

  return (
    <div className={className}>
      <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg px-2 md:px-4">
        <nav className="-mb-px flex flex-wrap gap-3 md:gap-6">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabClick(index)}
              disabled={tab.disabled}
              className={`py-2 px-3 md:px-4 border-b-2 font-medium text-sm rounded-t-md focus:outline-none transition-colors duration-200 whitespace-nowrap ${
                activeTab === index
                  ? 'border-blue-500 text-blue-700 bg-white shadow-sm'
                  : tab.disabled
                    ? 'border-transparent text-gray-400 cursor-not-allowed bg-gray-100 opacity-60'
                    : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                {tab.icon && (
                  typeof tab.icon === 'function' ? 
                    <tab.icon className="w-4 h-4" /> : 
                    <tab.icon className="w-4 h-4" />
                )}
                <span>{tab.label}</span>
                {tab.disabled && <span className="text-xs">🔒</span>}
              </div>
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-8 md:mt-10 px-1 md:px-4 pb-4">
        {tabs[activeTab] && !tabs[activeTab].disabled ? (
          tabs[activeTab].content
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Complete Your Profile First
            </h3>
            <p className="text-gray-600">
              You need to complete your company profile before accessing this feature.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tabs;