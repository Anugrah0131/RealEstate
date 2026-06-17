import React from "react";
import { Route, Routes } from "react-router-dom";
import LandingPage from "./pages/shared/LandingPage";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./pages/shared/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./components/common/AdminLayout";

const App = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <Routes>
        <Route path="/reset-password/:token" element={<ResetPassword/>}/>
        <Route path="/login" element={<Login/>} />
        <Route path="/verify-email" element={<VerifyEmail />}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>

        <Route path="/profile" element={<Profile />} />

        <Route path="/register" element={<Register/>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails/>}/>

        <Route element={<AdminLayout />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
