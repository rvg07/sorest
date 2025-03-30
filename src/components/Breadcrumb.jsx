import React from "react";

const Breadcrumb = ({ selectedCollection, selectedEndpoint }) => (
  <div className="flex items-center mb-4 text-sm text-gray-400">
    {selectedCollection ? (
      <>
        <span className="mr-2 font-medium text-gray-300">{selectedCollection.name}</span>
        {selectedEndpoint && (
          <>
            <span className="text-gray-500 mr-2">/</span>
            <span className="font-medium text-gray-300">
              {selectedEndpoint.name.split('/').pop() || selectedEndpoint.name}
            </span>
          </>
        )}
      </>
    ) : (
      <span className="font-medium text-gray-300">Select a Collection</span>
    )}
  </div>
);

export default Breadcrumb;
