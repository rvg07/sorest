import React from "react";
import { X, Plus } from "lucide-react";

const QueryParams = ({ params = [], setParams }) => {
  const handleChange = (id, field, value) => {
    const updated = params.map((param) =>
      param.id === id ? { ...param, [field]: value } : param
    );
    setParams(updated);
  };

  const handleToggle = (id) => {
    const updated = params.map((param) =>
      param.id === id ? { ...param, enabled: !param.enabled } : param
    );
    setParams(updated);
  };

  const handleRemove = (id) => {
    const updated = params.filter((param) => param.id !== id);
    setParams(updated);
  };

  const handleAddRow = () => {
    const newRow = { id: Date.now(), key: "", value: "", description: "", enabled: true };
    setParams([...params, newRow]);
  };

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Params</h3>
        <button
          onClick={handleAddRow}
          className="flex items-center space-x-1 rounded-r-md border border-gray-500 hover:bg-green-600 text-white px-2 py-1 rounded transition"
          title="Add Query Param"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs">Add</span>
        </button>
      </div>
      <div className="flex items-center text-xs text-gray-400 px-2 py-1 border-b border-gray-700">
        <div className="w-6"></div>
        <div className="flex-1 px-1 font-medium">Key</div>
        <div className="flex-1 px-1 font-medium">Value</div>
        <div className="w-6"></div>
      </div>
      <div className="space-y-2">
        {params.map((param) => (
          <div key={param.id} className="flex items-center border-b border-gray-700 px-2 py-1 group">
            <div className="w-6">
              <input
                type="checkbox"
                checked={param.enabled}
                onChange={() => handleToggle(param.id)}
                className="form-checkbox h-4 w-4 text-blue-500"
              />
            </div>
            <input
              type="text"
              value={param.key}
              placeholder="Parameter Key"
              onChange={(e) => handleChange(param.id, "key", e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-700 text-gray-200 rounded focus:outline-none text-xs"
            />
            <input
              type="text"
              value={param.value}
              placeholder="Parameter Value"
              onChange={(e) => handleChange(param.id, "value", e.target.value)}
              className="flex-1 px-2 py-1 bg-gray-700 text-gray-200 rounded focus:outline-none text-xs ml-2"
            />
            <button
              onClick={() => handleRemove(param.id)}
              className="ml-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryParams;
