import React from 'react';
import SoRest from './SoRest'; // Adjust path if needed
import './index.css'; // Import Tailwind CSS

function App() {
  return (
    // StrictMode might cause double renders in dev, remove if causing issues temporarily
    <React.StrictMode>
      <SoRest />
    </React.StrictMode>
  );
}

export default App;