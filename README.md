# SoRest
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web-based API client built using React, Tailwind CSS, and Vite and allows developers to create and manage API request collections, send requests (GET, POST, etc.), and view responses. Includes support for query parameters, headers, authorization placeholders, and request bodies with basic syntax highlighting.

![SoRest Screenshot](https://github.com/rvg07/sorest/blob/main/img/sorest.png)

## Table of Contents

*   [Overview](#overview)
*   [Tech Stack](#tech-stack)
*   [Setup](#setup)
    *   [Prerequisites](#prerequisites)
    *   [Installation](#installation)

## Overview

SoRest provides a simplified, browser-based interface for interacting with RESTful (and potentially SOAP) APIs. It allows developers to organize requests into collections, configure various request details (method, URL, query params, headers, body), send the requests through a local proxy to bypass CORS issues during development, and inspect the responses (body, headers, status, time, size). All collection data is persisted locally using the browser's `localStorage`.


## Tech Stack

*   **Frontend:**
    *   React (v18+)
    *   JavaScript (JSX) / TypeScript (Optional - project history includes TS conversion)
    *   Tailwind CSS (v3+) - Utility-first CSS framework
    *   Vite - Frontend build tool
    *   Lucide React - Icon library
    *   `@uiw/react-codemirror` - Code editor component for request/response bodies
    *   `axios` - Promise-based HTTP client for making requests (used by the proxy)
*   **Backend Proxy (for CORS):**
    *   Node.js
    *   Express - Web framework
    *   `axios` - To make requests from the proxy to the target API
    *   `cors` - Node.js CORS middleware



## Setup

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (v8+ recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    https://github.com/rvg07/sorest.git
    cd sorest
    ```

2.  **Install ALL dependencies:**
    *(This installs React, Vite, Tailwind, etc....)*
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    *   Rename the example environment `.env.example` file in `.env`.
    *   Edit the `.env` file with your local settings. Pay attention to:
        *   `PROXY_PORT`: The port your backend proxy server will run on (defaults to `3001` in `proxy-server.js` if not set). Ensure this doesn't clash with other services.
 
        *   `VITE_BACKEND_PROXY_URL`: The **full URL** your frontend should use to contact your backend proxy server (e.g., `http://localhost:3001`). **This is very important!**

    **`.env.example` should look something like this:**
    ```env
    # Port for the Vite frontend development server
    # PORT=5173

    # Backend Proxy Configuration
    PROXY_PORT=3001

    # URL the frontend uses to talk to the BACKEND proxy
    VITE_BACKEND_PROXY_URL=http://localhost:3001
    ```

### Running Locally

1.  **Start Both Servers:**
    Open a terminal in the project root and run the combined development script (assuming you've set up `concurrently` in `package.json` as shown previously):
    ```bash
    npm run dev
    ```
    This command should:
    *   Start the **Backend Proxy Server** (listening on the port defined by `PROXY_PORT` in your `.env` file, likely `3001`).
    *   Start the **Frontend Vite Development Server** (usually on `http://localhost:5173` or the next available port).

2.  **Access the Application:**
    In dev mode usually url is: `http://localhost:5173`.

3.  **Usage:**
    *   When click "Send", the React app will make a request to the URL specified in `VITE_BACKEND_PROXY_URL` (`http://localhost:3001/proxy-request`).
    *   Backend proxy server will handle the request, contact the *actual* target API specified in the URL input field, and return the response.
