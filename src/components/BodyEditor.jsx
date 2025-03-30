import React, { useState, useEffect, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { githubDark } from "@uiw/codemirror-theme-github";
import { json } from "@codemirror/lang-json";
import { xml } from '@codemirror/lang-xml';

const BodyEditor = ({
    body = "",
    setBody,
    endpointType,
    initialRawType = 'JSON',
    onRawTypeChange
}) => {
    const [bodyType, setBodyType] = useState('raw');
    const [rawType, setRawType] = useState(initialRawType);

    useEffect(() => {
        setRawType(initialRawType);
    }, [initialRawType]);

    const handleCmChange = useCallback((newValue) => {
        setBody(newValue);
    }, [setBody]);

    const handleTypeChange = (e) => {
        setBodyType(e.target.value);
    };

    const handleRawTypeChange = (e) => {
        const newType = e.target.value;
        setRawType(newType); 

        if (onRawTypeChange) {
            onRawTypeChange(newType);
        }
    };

    // we determine CodeMirror extensions based on rawType
    const getExtensions = () => {
        switch(rawType) {
            case 'JSON': return [json()];
            case 'XML': return [xml()];
            default: return []; // plain text as default
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-800 rounded-lg shadow-md flex flex-col flex-grow h-full"> {/* Layout */}
            <div className="flex items-center space-x-4 mb-3 pb-3 border-b border-gray-700 flex-shrink-0"> {/* Header area */}
                 {(['none', 'form-data', 'x-www-form-urlencoded', 'raw']).map(type => (
                     <label key={type} className="flex items-center space-x-1 text-xs text-gray-400 cursor-pointer">
                        <input type="radio" name="bodyType" value={type} checked={bodyType === type} onChange={handleTypeChange} className="form-radio h-3 w-3 text-blue-500 bg-gray-700 border-gray-600 focus:ring-blue-500"/>
                        <span>{type.replace('-', ' ')}</span>
                    </label>
                ))}
                {/* select dropdown */}
                {bodyType === 'raw' && (
                    <select
                        value={rawType}
                        onChange={handleRawTypeChange}
                        className="ml-auto bg-gray-700 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                         {(['JSON', 'XML', 'Text']).map(rt => <option key={rt} value={rt}>{rt}</option>)}
                    </select>
                 )}
            </div>
            {/* editor area */}
            <div className="flex-grow flex flex-col overflow-hidden min-h-[200px]"> {/* Ensure minimum height and allow growth */}
                {bodyType === 'none' && ( <div className="flex-grow flex items-center justify-center text-gray-500 italic text-sm">This request does not have a body.</div> )}
                {bodyType === 'raw' && (
                     <div className="flex-grow h-full w-full overflow-auto border border-gray-700 rounded">
                         <CodeMirror
                             value={body}
                             height="100%"
                             theme={githubDark}
                             extensions={getExtensions()}
                             onChange={handleCmChange}
                             className="h-full text-sm"
                             basicSetup={{
                                 lineNumbers: true,
                                 foldGutter: true,
                                 highlightActiveLine: true,
                                 autocompletion: true, // Enable basic features
                                 syntaxHighlighting: true,
                             }}
                         />
                    </div>
                )}
                {bodyType === 'form-data' && ( <div className="text-gray-500 text-sm italic p-4 text-center flex-grow flex items-center justify-center">Form-data editor not implemented yet.</div> )}
                 {bodyType === 'x-www-form-urlencoded' && ( <div className="text-gray-500 text-sm italic p-4 text-center flex-grow flex items-center justify-center">x-www-form-urlencoded editor not implemented.</div> )}
            </div>
        </div>
    );
};

export default BodyEditor;
