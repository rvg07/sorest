export const STORAGE_KEY = "sorest_collections";

// default collection initial data
export const defaultCollections = [
    {
        id: "READY_TO_USE_API_REST",
        name: "READY_TO_USE_API_REST",
        endpoints: [
            {
                id: "get_1",
                method: "GET",
                name: "https://httpbin.org/get",
                type: "REST",
                color: "text-green-400",
                auth: [],
                headers: [
                    { id: "header1", key: "Content-Type", value: "application/json", enabled: true },
                ],                
                body: "",
                queryParams: [{ id: 1, key: "", value: "", description: "", enabled: true }],
            },

        ],
    },
];
