import React from 'react';
import './styles/app-theme.css';
import { AddressManagementPage } from './features/addresses';

function App() {
  return (
    <div className="min-vh-100 bg-light">
      <AddressManagementPage />
    </div>
  );
}

export default App;