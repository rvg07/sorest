import React from "react";
import { X, Edit } from "lucide-react";

const WorkspaceHeader = ({
  onDeleteCollection,
  onSaveCollection,
  selectedCollection,
  onRenameCollection,
}) => {
  const handleRename = () => {
    if (selectedCollection) {
      const newName = prompt("Enter new collection name", selectedCollection.name);
      if (newName && newName.trim() !== "") {
        onRenameCollection(selectedCollection.id, newName.trim());
      }
    }
  };

  return (
    <div className="flex items-center px-4 py-2 border-b border-gray-700 bg-gray-850">
      <div className="flex items-center">
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2">
          <span className="text-white text-xs">SR</span>
        </div>
        <span className="font-medium">SoRest</span>
      </div>
      <div className="flex-grow"></div>
      {selectedCollection && (
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRename}
            className="flex items-center px-3 py-1.5 border border-yellow-600 text-yellow-400 rounded-md hover:bg-yellow-600 hover:text-white transition text-xs"
            title="Rename Collection"
          >
            <span>Rename Collection</span>
          </button>
          <button
            onClick={() => onSaveCollection(selectedCollection.id)}
            className="flex items-center px-3 py-1.5 border border-green-600 text-green-400 rounded-md hover:bg-green-600 hover:text-white transition text-xs"
            title="Save Collection"
          >
            <span>Save Collection</span>
          </button>
          <button
            onClick={() => onDeleteCollection(selectedCollection.id)}
            className="flex items-center px-3 py-1.5 border border-red-600 text-red-400 rounded-md hover:bg-red-600 hover:text-white transition text-xs"
            title="Delete Selected Collection"
          >
            <span>Delete Collection</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;
