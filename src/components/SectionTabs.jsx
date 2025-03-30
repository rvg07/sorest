import React from "react";

const SectionTabs = ({ activeTab, setActiveTab, tabs }) => (
  <div className="flex mt-4 border-b border-gray-700">
    {tabs.map((tab) => (
      <button
        key={tab}
        className={`px-3 py-2 text-xs font-medium cursor-pointer transition border-b-2 ${
          activeTab === tab
            ? "text-orange-400 border-orange-400"
            : "text-gray-400 border-transparent hover:text-gray-200"
        }`}
        onClick={() => setActiveTab(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default SectionTabs;
