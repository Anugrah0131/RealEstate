import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/shared/LandingPage";
import Properties from "./pages/Properties";

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<Properties />} />
      </Routes>
    </div>
  );
};

export default App;
