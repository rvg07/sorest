import React from "react";
import { X, Plus } from "lucide-react";
import { generateUniqueId } from "../utils/helpers";

const Headers = ({ rows = [], setRows }) => {
  const handleChange = (id, field, value) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const updated = safeRows.map((row) =>
      row.id === id ? { ...row, [field]: value } : row
    );
    setRows(updated);
  };

  const handleToggle = (id) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const updated = safeRows.map((row) =>
      row.id === id ? { ...row, enabled: !row.enabled } : row
    );
    setRows(updated);
  };

  const handleRemove = (id) => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const updated = safeRows.filter((row) => row.id !== id);
    setRows(updated);
  };

  const handleAddRow = () => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const newRow = { id: generateUniqueId('header'), key: "", value: "", enabled: true };
    setRows([...safeRows, newRow]);
  };

  const safeRenderRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200">Headers</h3>
        <button
          onClick={handleAddRow}
          className="flex items-center space-x-1 border border-gray-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition"
          title="Add Header"
        >
          <Plus className="w-4 h-4" />
          <span className="text-xs">Add</span>
        </button>
      </div>
      <div className="flex items-center text-xs text-gray-400 px-2 py-1 border-b border-gray-700">
        <div className="w-6 mr-2"></div>
        <div className="flex-1 px-1 font-medium">Header Name</div>
        <div className="flex-1 px-1 font-medium ml-2">Header Value</div>
        <div className="w-6 ml-2"></div>
      </div>
      <div className="space-y-1 mt-1">
        {safeRenderRows.map((row) => (
          <div key={row.id} className={`flex items-center border-b border-gray-700 px-2 py-1 group ${!row.enabled ? 'opacity-50' : ''}`}>
            <div className="w-6 mr-2 flex-shrink-0">
              <input
                type="checkbox"
                checked={!!row.enabled}
                onChange={() => handleToggle(row.id)}
                className="form-checkbox h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-offset-gray-800 focus:ring-1"
              />
            </div>
            <input
              type="text"
              value={row.key || ''}
              placeholder="Header Name"
              onChange={(e) => handleChange(row.id, "key", e.target.value)}
              disabled={!row.enabled}
              className={`flex-1 px-2 py-1 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ${!row.enabled ? 'text-gray-500 line-through' : ''}`}
            />
            <input
              type="text"
              value={row.value || ''}
              placeholder="Header Value"
              onChange={(e) => handleChange(row.id, "value", e.target.value)}
              disabled={!row.enabled}
              className={`flex-1 px-2 py-1 bg-gray-700 text-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs ml-2 ${!row.enabled ? 'text-gray-500 line-through' : ''}`}
            />
            <button
              onClick={() => handleRemove(row.id)}
              className="ml-2 w-6 flex-shrink-0 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {safeRenderRows.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4 italic">No headers added!</div>
        )}
      </div>
    </div>
  );
};

export default Headers;
