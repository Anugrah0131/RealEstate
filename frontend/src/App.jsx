import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/shared/LandingPage";

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Routes>
        <Route path="/" element={<LandingPage />} />
      
      </Routes>
    </div>
  );
};

export default App;
