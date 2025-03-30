import React, { useState, useEffect } from "react";
import axios from "axios";
import WorkspaceHeader from "./components/WorkspaceHeader";
import Sidebar from "./components/Sidebar";
import RequestPanel from "./components/Request/RequestPanel";
import ResponsePanel from "./components/Response/ResponsePanel";
import { STORAGE_KEY, defaultCollections } from "./utils/constants";

const SoRest = () => {
  const [collections, setCollections] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    try {
      const parsed = stored ? JSON.parse(stored) : defaultCollections;
      return Array.isArray(parsed) ? parsed : defaultCollections;
    } catch (e) {
      console.error("Failed to parse collections from localStorage", e);
      return defaultCollections;
    }
  });

  const [expandedItems, setExpandedItems] = useState(() =>
    collections.reduce((acc, coll) => {
      acc[coll.id] = false;
      return acc;
    }, {})
  );

  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  const toggleItem = (collId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [collId]: !prev[collId],
    }));
  };

  const handleSelectCollection = (coll) => {
    setSelectedCollection(coll);
    setSelectedEndpoint(null);
    setApiResponse(null);
  };

  const handleSelectEndpoint = (coll, ep) => {
    setSelectedCollection(coll);
    setSelectedEndpoint(ep);
    setApiResponse(null);
    if (!expandedItems[coll.id]) {
      toggleItem(coll.id);
    }
  };

  const handleAddCollection = (name) => {
    const newId =
      name.toLowerCase().replace(/[^a-z0-9]+/g, "_") + "_" + Date.now();
    const newCollection = {
      id: newId,
      name,
      endpoints: [],
    };
    setCollections((prev) => [...prev, newCollection]);
    setExpandedItems((prev) => ({ ...prev, [newCollection.id]: true }));
    setSelectedCollection(newCollection);
    setSelectedEndpoint(null);
    setApiResponse(null);
  };

  const handleRenameCollection = (collId, newName) => {
    const updatedCollections = collections.map((coll) =>
      coll.id === collId ? { ...coll, name: newName } : coll
    );
    setCollections(updatedCollections);
    // If the renamed collection is currently selected, update its value as well.
    if (selectedCollection && selectedCollection.id === collId) {
      setSelectedCollection((prev) => ({ ...prev, name: newName }));
    }
  };
  
  const handleAddEndpoint = (endpointData) => {
    if (!selectedCollection) return;
    const newEndpoint = {
      ...endpointData,
      id: endpointData.id || Date.now().toString(),
      method: endpointData.method || "GET",
      type: endpointData.type || "REST",
      color: endpointData.color || "",
      queryParams: endpointData.queryParams || [],
      headers: endpointData.headers || [],
      auth: endpointData.auth || [],
      body: endpointData.body || "",
    };

    const updatedCollections = collections.map((coll) => {
      if (coll.id === selectedCollection.id) {
        const endpoints = Array.isArray(coll.endpoints) ? coll.endpoints : [];
        return { ...coll, endpoints: [...endpoints, newEndpoint] };
      }
      return coll;
    });
    setCollections(updatedCollections);
    setSelectedEndpoint(newEndpoint);
    setApiResponse(null);
  };

  const handleUpdateEndpoint = (updatedEndpoint) => {
    if (!selectedCollection) return;
    const updatedCollections = collections.map((coll) => {
      if (coll.id === selectedCollection.id) {
        const endpoints = Array.isArray(coll.endpoints) ? coll.endpoints : [];
        return {
          ...coll,
          endpoints: endpoints.map((ep) =>
            ep.id === updatedEndpoint.id ? { ...ep, ...updatedEndpoint } : ep
          ),
        };
      }
      return coll;
    });
    setCollections(updatedCollections);
    setSelectedEndpoint((prev) => ({ ...prev, ...updatedEndpoint }));
  };

  const handleDeleteCollection = (collId) => {
    if (!window.confirm("Are you sure you want to delete this entire collection?"))
      return;
    const updated = collections.filter((coll) => coll.id !== collId);
    setCollections(updated);
    if (selectedCollection && selectedCollection.id === collId) {
      setSelectedCollection(null);
      setSelectedEndpoint(null);
      setApiResponse(null);
    }
    setExpandedItems((prev) => {
      const newState = { ...prev };
      delete newState[collId];
      return newState;
    });
  };

  const handleDeleteEndpoint = (collId, epId) => {
    if (!window.confirm("Are you sure you want to delete this endpoint?"))
      return;
    let newSelectedEndpoint = selectedEndpoint;
    const updatedCollections = collections.map((coll) => {
      if (coll.id === collId) {
        const endpoints = Array.isArray(coll.endpoints) ? coll.endpoints : [];
        const updatedEndpoints = endpoints.filter((ep) => ep.id !== epId);
        if (selectedEndpoint && selectedEndpoint.id === epId) {
          const currentIndex = endpoints.findIndex((ep) => ep.id === epId);
          newSelectedEndpoint =
            updatedEndpoints.length > 0
              ? updatedEndpoints[Math.max(0, currentIndex - 1)]
              : null;
        }
        return { ...coll, endpoints: updatedEndpoints };
      }
      return coll;
    });
    setCollections(updatedCollections);
    setSelectedEndpoint(newSelectedEndpoint);
    if (!newSelectedEndpoint) {
      setApiResponse(null);
    } else {
      setApiResponse(null);
    }
  };

  const handleSaveCollection = (collId) => {
    console.log("Saving collection (already saved to localStorage on change):", collId);
    alert(`Collection changes are automatically saved locally.`);
  };

  const handleSendRequest = async (requestConfig) => {
    setIsLoading(true);
    setApiResponse(null);
    const startTime = Date.now();
    const proxyEndpoint = "http://localhost:3001/proxy-request";

    try {
      const response = await axios.post(
        proxyEndpoint,
        {
          targetUrl: requestConfig.url,
          method: requestConfig.method,
          headers: requestConfig.headers,
          data: requestConfig.body,
          requestType: requestConfig.type,
        },
        {
          timeout: 60000,
          responseType: "text",
          transformResponse: [(data) => data],
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;
      let proxyResponseData;
      try {
        proxyResponseData = JSON.parse(response.data);
      } catch (e) {
        console.error("Failed to parse response from proxy:", e);
        setApiResponse({
          status: response.status,
          statusText: "Proxy Parse Error",
          headers: response.headers,
          data: `Error parsing response from proxy:\n${response.data}`,
          time: duration,
          size: response.data ? new Blob([response.data]).size : 0,
          error: true,
        });
        setIsLoading(false);
        return;
      }
      const targetHeaders = proxyResponseData.headers || {};
      const targetData = proxyResponseData.data;
      const responseSize = targetData ? new Blob([JSON.stringify(targetData)]).size : 0;
      setApiResponse({
        status: proxyResponseData.status,
        statusText: proxyResponseData.statusText,
        headers: targetHeaders,
        data: targetData,
        time: duration,
        size: responseSize,
        error: proxyResponseData.error || false,
      });
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      if (error.response) {
        setApiResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: `Proxy Error: ${error.response.data}`,
          time: duration,
          size: 0,
          error: true,
        });
      } else if (error.request) {
        setApiResponse({
          status: null,
          statusText: "Proxy Unreachable",
          headers: {},
          data: "Could not connect to the backend proxy service.",
          time: duration,
          size: 0,
          error: true,
        });
      } else {
        setApiResponse({
          status: null,
          statusText: "Proxy Request Setup Error",
          headers: {},
          data: error.message,
          time: duration,
          size: 0,
          error: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-200 text-sm">
      <WorkspaceHeader
        onDeleteCollection={handleDeleteCollection}
        onSaveCollection={handleSaveCollection}
        selectedCollection={selectedCollection}
        onRenameCollection={handleRenameCollection}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collections={collections}
          expandedItems={expandedItems}
          toggleItem={toggleItem}
          onSelectCollection={handleSelectCollection}
          onSelectEndpoint={handleSelectEndpoint}
          onAddCollection={handleAddCollection}
          selectedEndpointId={selectedEndpoint?.id}
          selectedCollection={selectedCollection}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 border-b border-gray-700">
            <RequestPanel
              selectedCollection={selectedCollection}
              selectedEndpoint={selectedEndpoint}
              onAddEndpoint={handleAddEndpoint}
              onDeleteEndpoint={handleDeleteEndpoint}
              onUpdateEndpoint={handleUpdateEndpoint}
              onSendRequest={handleSendRequest}
              isSending={isLoading}
            />
          </div>
          <ResponsePanel responseData={apiResponse} isLoading={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default SoRest;
