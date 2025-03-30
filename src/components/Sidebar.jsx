import React, { useState } from "react";
import { ChevronDown, ChevronRight, X, Plus, Search } from "lucide-react";

const Sidebar = ({
  collections,
  expandedItems,
  toggleItem,
  onSelectCollection,
  onSelectEndpoint,
  onAddCollection,
  selectedEndpointId,
  selectedCollection,
}) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [filterText, setFilterText] = useState("");

  const handleAddCollection = (e) => {
    e.stopPropagation();
    if (newCollectionName.trim()) {
      onAddCollection(newCollectionName.trim());
      setNewCollectionName("");
    }
  };

  return (
    <aside className="w-72 border-r border-gray-700 flex flex-col bg-gray-850">
      <div className="p-4 m-3 bg-gray-800 rounded-md shadow-md">
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Filter collections..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md bg-gray-700 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search className="w-4 h-4" />
          </span>
        </div>
        <div className="flex">
          <input
            type="text"
            placeholder="Add collection name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddCollection(e)}
            className="flex-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={handleAddCollection}
            className="hover:bg-green-600 text-white px-4 py-2 rounded-r-md border border-gray-600 transition"
            title="Add Collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-1 pr-1">
        {collections
          .filter((coll) =>
            coll.name.toLowerCase().includes(filterText.toLowerCase())
          )
          .map((coll) => (
            <div key={coll.id} className="group text-sm">
              <div
                className={`flex items-center p-1.5 mx-1 rounded hover:bg-gray-700 cursor-pointer transition ${
                  selectedCollection?.id === coll.id && !selectedEndpointId
                    ? "bg-gray-750"
                    : ""
                }`}
                onClick={() => {
                  if (coll.endpoints && coll.endpoints.length > 0) {
                    toggleItem(coll.id);
                  }
                  onSelectCollection(coll);
                }}
              >
                {coll.endpoints && coll.endpoints.length > 0 ? (
                  expandedItems[coll.id] ? (
                    <ChevronDown className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                  )
                ) : (
                  <span className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                )}
                <span className="truncate text-gray-300">{coll.name}</span>
              </div>
              {expandedItems[coll.id] &&
                coll.endpoints &&
                coll.endpoints.map((ep) => (
                  <div
                    key={ep.id}
                    className={`flex items-center pl-6 pr-1.5 py-1 mx-1 hover:bg-gray-800 cursor-pointer transition ${
                      selectedEndpointId === ep.id
                        ? "bg-gray-700 text-white"
                        : "text-gray-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEndpoint(coll, ep);
                    }}
                    title={ep.name}
                  >
                    <span
                      className={`w-10 flex-shrink-0 mr-1 font-medium text-xs ${
                        selectedEndpointId === ep.id
                          ? "text-white"
                          : ep.color || "text-gray-400"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <div className="flex-grow flex items-center min-w-0">
                      <span
                        className={`truncate ${
                          selectedEndpointId === ep.id
                            ? "text-white"
                            : "text-gray-300"
                        }`}
                      >
                        {ep.name.startsWith("http")
                          ? ep.name.split("/").pop() || ep.name
                          : ep.name}
                      </span>
                      {ep.type && (
                        <span
                          className={`ml-1.5 text-xs flex-shrink-0 ${
                            selectedEndpointId === ep.id
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          [{ep.type}]
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </aside>
  );
};

export default Sidebar;
