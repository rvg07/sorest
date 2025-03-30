import React, { useState, useEffect, useCallback } from 'react';
import { Send, X } from 'lucide-react';
import Breadcrumb from '../Breadcrumb';
import SectionTabs from '../SectionTabs';
import QueryParams from '../QueryParams';
import Headers from '../Headers';
import BodyEditor from '../BodyEditor';
import { getMethodColor, getAllowedMethods } from '../../utils/helpers';
import { generateUniqueId, ensureStableStringIds } from '../../utils/idUtils';

const RAW_TYPES = { JSON: 'JSON', XML: 'XML', Text: 'Text' };

const RequestPanel = ({
  selectedCollection,
  selectedEndpoint,
  onAddEndpoint,
  onDeleteEndpoint,
  onUpdateEndpoint,
  onSendRequest,
  isSending
}) => {
  const [activeTab, setActiveTab] = useState("Params");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [endpointData, setEndpointData] = useState({ method: "GET", type: "REST", auth: [], headers: [], body: "", queryParams: [] });
  const [currentRawType, setCurrentRawType] = useState(RAW_TYPES.JSON);
  const isDisabled = !selectedCollection;
  let initialRawType = RAW_TYPES.JSON; 

  // going to define header type based on body raw type
  useEffect(() => {
    if (selectedEndpoint) {
      setEndpointUrl(selectedEndpoint.name || "");
      const processedParams = ensureStableStringIds(selectedEndpoint.queryParams, 'param');
      const processedHeaders = ensureStableStringIds(selectedEndpoint.headers, 'header');
      const processedAuth = ensureStableStringIds(selectedEndpoint.auth, 'auth');
      const newActiveTab = selectedEndpoint.body && ['POST', 'PUT', 'PATCH'].includes(selectedEndpoint.method || 'GET') ? 'Body' : 'Params';

      const contentTypeHeader = processedHeaders.find(h => h.key.toLowerCase() === 'content-type' && h.enabled);
      if (contentTypeHeader?.value.includes('json')) initialRawType = RAW_TYPES.JSON;
      else if (contentTypeHeader?.value.includes('xml')) initialRawType = RAW_TYPES.XML;
      else if (contentTypeHeader?.value.includes('text')) initialRawType = RAW_TYPES.Text;

      setEndpointData({ method: selectedEndpoint.method || "GET", type: selectedEndpoint.type || "REST", body: selectedEndpoint.body || "", auth: processedAuth, headers: processedHeaders, queryParams: processedParams });
      setActiveTab(newActiveTab);
      setCurrentRawType(initialRawType);

    } else {
      setEndpointUrl("");
      setEndpointData({ method: "GET", type: "REST", body: "", auth: [], headers: [], queryParams: [] });
      setActiveTab("Params");
      setCurrentRawType(initialRawType);
    }
  }, [selectedEndpoint]);

  const handleSaveEndpoint = () => {
    if (!selectedCollection) return;
    if (endpointUrl.trim() === "") {
      alert("Endpoint URL cannot be empty.");
      return;
    }
    // we force method to POST if the endpoint type is SOAP.
    const method = endpointData.type === "SOAP" ? "POST" : endpointData.method;

    const saveData = {
      ...endpointData,
      name: endpointUrl,
      method,
      color: getMethodColor(method),
      queryParams: endpointData.queryParams.filter(
        (p) => p.enabled && (p.key || p.value)
      ),
      headers: endpointData.headers.filter(
        (h) => h.enabled && (h.key || h.value)
      ),
      auth: endpointData.auth.filter((a) => a.enabled && (a.key || a.value)),
    };

    if (!selectedEndpoint) {
      let simpleName = endpointUrl.split("/").pop() || endpointUrl;
      onAddEndpoint({
        ...saveData,
        id: `${saveData.method}_${simpleName.substring(0, 15)}_${Date.now()}`
          .replace(/[^a-zA-Z0-9_]/g, "_"),
      });
    } else {
      onUpdateEndpoint({
        ...selectedEndpoint,
        ...saveData,
      });
    }
  };

  const handleSendInternal = () => {
    if (endpointUrl && !isSending) {
      const activeParams = endpointData.queryParams
        .filter(p => p.enabled && p.key)
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      const finalUrl = activeParams ? `${endpointUrl}${endpointUrl.includes('?') ? '&' : '?'}${activeParams}` : endpointUrl;

      const activeHeaders = endpointData.headers
        .filter(h => h.enabled && h.key)
        .reduce((acc, cur) => {
          acc[cur.key] = cur.value;
          return acc;
        }, {});

      onSendRequest({
        url: finalUrl,
        method: endpointData.method,
        headers: activeHeaders,
        body: (endpointData.method === 'POST' || endpointData.method === 'PUT') ? endpointData.body : undefined,
        type: endpointData.type,
      });
    }
  };

  const handleDataChange = useCallback((field, value) => {
    setEndpointData((prev) => {
      const isArrayField = ["queryParams", "headers", "auth"].includes(field);
      const correctedValue = isArrayField ? (Array.isArray(value) ? value : []) : value;

      if (field === 'headers' && Array.isArray(correctedValue)) {
        const contentTypeHeader = correctedValue.find(h => h.key.toLowerCase() === 'content-type' && h.enabled);
        let newRawType = currentRawType;
        if (contentTypeHeader?.value.includes('json')) newRawType = RAW_TYPES.JSON;
        else if (contentTypeHeader?.value.includes('xml')) newRawType = RAW_TYPES.XML;
        else if (contentTypeHeader?.value.includes('text')) newRawType = RAW_TYPES.Text;
        if (newRawType !== currentRawType) { setCurrentRawType(newRawType); }
      }
      return { ...prev, [field]: correctedValue };
    });
  }, [currentRawType]);

  const handleRawTypeChange = useCallback((newRawType) => {
    setCurrentRawType(newRawType);
    let contentTypeValue = '';
    switch (newRawType) {
      case RAW_TYPES.JSON: contentTypeValue = 'application/json'; break;
      case RAW_TYPES.XML: contentTypeValue = endpointData.type === 'SOAP' ? 'application/soap+xml' : 'application/xml'; break;
      case RAW_TYPES.Text: default: contentTypeValue = 'text/plain'; break;
    }

    setEndpointData(prev => {
      const currentHeaders = Array.isArray(prev.headers) ? prev.headers : [];
      let headerUpdated = false;
      const updatedHeaders = currentHeaders.map(header => {
        if (header.key.toLowerCase() === 'content-type') {
          headerUpdated = true;
          return { ...header, value: contentTypeValue, enabled: header.enabled };
        } return header;
      });
      if (!headerUpdated) {
        updatedHeaders.push({ id: generateUniqueId('header'), key: 'Content-Type', value: contentTypeValue, enabled: true });
      }
      return { ...prev, headers: updatedHeaders };
    });
  }, [endpointData.type]);

  const handleUrlChange = (e) => { setEndpointUrl(e.target.value); };
  const handleDeleteInternal = () => { if (selectedEndpoint && selectedCollection) { onDeleteEndpoint(selectedCollection.id, selectedEndpoint.id); } };

  const requestTabs = ["Params", "Headers", "Body"];
  const visibleTabs = requestTabs;
  const setQueryParams = useCallback((p) => handleDataChange("queryParams", p), [handleDataChange]);
  // const setAuthRows = useCallback((r) => handleDataChange("auth", r), [handleDataChange]);
  const setHeadersRows = useCallback((r) => handleDataChange("headers", r), [handleDataChange]);
  const setBodyContent = useCallback((b) => handleDataChange("body", b), [handleDataChange]);
  const onRawTypeChange = useCallback((t) => handleRawTypeChange(t), [handleRawTypeChange]);

  return (
    <div className="p-4 flex flex-col flex-grow overflow-hidden bg-gray-850">
      <Breadcrumb selectedCollection={selectedCollection} selectedEndpoint={selectedEndpoint} />
      {/* input row */}
      <div className="flex items-center space-x-3 p-4 bg-slate-800 shadow-md rounded-md">
        <select
          value={endpointData.method}
          onChange={(e) => handleDataChange('method', e.target.value)}
          className="bg-slate-700 text-emerald-400 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
          disabled={isDisabled}
        >
          {getAllowedMethods(endpointData.type).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter request URL"
          value={endpointUrl}
          onChange={handleUrlChange}
          className="flex-1 bg-slate-700 border border-slate-600 rounded py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={isDisabled}
        />

        <select
          value={endpointData.type}
          onChange={(e) => handleDataChange('type', e.target.value)}
          className="bg-slate-700 border border-slate-600 text-gray-300 px-2 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          disabled={isDisabled}
        >
          <option value="REST">REST</option>
          <option value="SOAP">SOAP</option>
        </select>

        <button
          onClick={handleSaveEndpoint}
          className="px-4 py-2 border border-emerald-500 text-emerald-500 rounded hover:bg-emerald-500 hover:text-white transition"
          disabled={isDisabled || isSending}
          title="Save endpoint changes"
        >
          Save
        </button>

        <button
          onClick={handleSendInternal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          disabled={isDisabled || !endpointUrl || isSending}
          title="Send Request"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
      {/* the tabs and content Area */}
      {selectedCollection && (
        <div className="flex flex-col flex-grow mt-1 overflow-hidden">
          <SectionTabs activeTab={activeTab} setActiveTab={setActiveTab} tabs={visibleTabs} />
          <div className="flex-grow pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 bg-gray-900"> {/* Changed bg */}
            <div className="p-4">
              {activeTab === "Params" && (<QueryParams params={endpointData.queryParams} setParams={setQueryParams} />)}
              {activeTab === "Headers" && (<Headers rows={endpointData.headers} setRows={setHeadersRows} />)}
              {activeTab === "Body" && (
                <BodyEditor
                  body={endpointData.body}
                  setBody={setBodyContent}
                  endpointType={endpointData.type}
                  initialRawType={currentRawType}
                  onRawTypeChange={onRawTypeChange}
                />
              )}
            </div>
          </div>
          {selectedEndpoint && (<div className="flex-shrink-0 mt-auto pt-3 pb-2 px-4 border-t border-gray-700 flex justify-end bg-gray-900"> <button onClick={handleDeleteInternal} className="px-3 py-1 border border-red-600 text-red-400 rounded hover:bg-red-600 hover:text-white transition text-xs disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSending} title="Delete endpoint">Delete Endpoint</button> </div>)}
        </div>
      )}
      {!selectedCollection && (<div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic mt-2"> <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mt-2 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}> <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> </svg> Select or create a Collection... </div>)}
    </div>
  );
};
export default RequestPanel;
