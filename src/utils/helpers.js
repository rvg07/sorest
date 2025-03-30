export const getMethodColor = (method) => {
    const upper = method.toUpperCase();
    if (upper === "GET") return "text-green-400";
    if (upper === "POST") return "text-yellow-400";
    if (upper === "PUT") return "text-blue-400";
    if (upper === "DELETE") return "text-red-400";
    return "text-gray-400";
  };
  
  export const getAllowedMethods = (endpointType) =>
    endpointType === "SOAP" ? ["POST"] : ["GET", "POST", "PUT", "DELETE"];
  
  export const generateUniqueId = (prefix) =>
    `${prefix}_${crypto.randomUUID ? crypto.randomUUID() : Date.now() + "_" + Math.random()}`;
  