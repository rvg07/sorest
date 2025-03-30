import React, { useState } from "react";
import { Send, Copy } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { json } from "@codemirror/lang-json";

const ResponsePanel = ({ responseData, isLoading }) => {
  const [activeTab, setActiveTab] = useState("Body");
  const tabs = ["Body", "Headers"];

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-green-400";
    if (status >= 300 && status < 400) return "text-yellow-400";
    if (status >= 400 && status < 500) return "text-orange-400";
    if (status >= 500) return "text-red-500";
    return "text-gray-400";
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        console.log("Copied to clipboard");
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const formatJson = (data) => {
    try {
      const jsonData = typeof data === "string" ? JSON.parse(data) : data;
      return JSON.stringify(jsonData, null, 2);
    } catch (e) {
      return typeof data === "string" ? data : String(data);
    }
  };

  return (
    <div className="flex-1 flex flex-col border-t border-gray-700 overflow-hidden">
      <div className="px-4 pt-2 pb-1 border-b border-gray-700 bg-gray-850">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-sm text-gray-200">Response</span>
          {responseData && !isLoading && (
            <div className="flex items-center space-x-4 text-xs">
              <span className={`font-medium ${getStatusColor(responseData.status)}`}>
                Status: {responseData.status} {responseData.statusText}
              </span>
              <span className="text-gray-400">
                Time: {responseData.time} ms
              </span>
              <span className="text-gray-400">
                Size: {formatBytes(responseData.size)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 ${
                activeTab === tab
                  ? "text-orange-400 border-orange-400"
                  : "text-gray-400 border-transparent hover:text-gray-200"
              }`}
              onClick={() => setActiveTab(tab)}
              disabled={!responseData || isLoading}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-800 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
            <div className="text-gray-300">Loading response...</div>
          </div>
        )}
        {!responseData && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Send className="w-10 h-10 mb-2 text-gray-600" />
            <p>Click 'Send' to get a response</p>
          </div>
        )}
        {responseData && !isLoading && (
          <div className="p-2">
            {activeTab === "Body" && (
              <div className="relative group">
                <button
                  onClick={() => copyToClipboard(formatJson(responseData.data))}
                  className="absolute top-1 right-1 z-10 p-1 bg-gray-700 rounded text-gray-400 hover:text-white hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Body"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words font-mono">
                  <CodeMirror
                    readOnly={true}
                    value={formatJson(responseData.data) + "\n\n\n"}
                    height="100%"
                    theme={githubDark}
                    extensions={[json()]}
                    onChange={(e) => {}}
                    className="h-full text-sm"
                    basicSetup={{
                      lineNumbers: true,
                      foldGutter: true,
                      highlightActiveLine: true,
                    }}
                  />
                </pre>
              </div>
            )}
            {activeTab === "Headers" && (
              <div className="relative group">
                <button
                  onClick={() => copyToClipboard(JSON.stringify(responseData.headers, null, 2))}
                  className="absolute top-1 right-1 z-10 p-1 bg-gray-700 rounded text-gray-400 hover:text-white hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy Headers"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <table className="w-full text-xs text-gray-300">
                  <tbody>
                    {Object.entries(responseData.headers || {}).map(([key, value]) => (
                      <tr key={key} className="border-b border-gray-700">
                        <td className="py-1 px-2 font-medium align-top w-1/4">{key}</td>
                        <td className="py-1 px-2 break-all">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsePanel;