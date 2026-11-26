import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Public Auth Pages
import Landing from "../pages/Landing";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Onboarding Pages
import OrganizationChoice from "../organization/OrganizationChoice";
import CreateOrganization from "../organization/CreateOrganization";
import JoinOrganization from "../organization/JoinOrganization";

// Protected Layout & Guard
import ProtectedRoute from "../components/ProtectedRoute";
import AppLayout from "../components/AppLayout";

// Console Pages
import Dashboard from "../pages/Dashboard";
import VideoUpload from "../pages/VideoUpload";
import VideoLibrary from "../pages/VideoLibrary";
import Alerts from "../pages/Alerts";
import Incidents from "../pages/Incidents";
import Analytics from "../pages/Analytics";
import TeamManagement from "../pages/TeamManagement";
import OrganizationSettings from "../pages/OrganizationSettings";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/welcome" element={<Landing />} />
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Organization Onboarding (Requires Login) */}
      <Route element={<ProtectedRoute requireOrg={false} />}>
        <Route path="/organization" element={<OrganizationChoice />} />
        <Route path="/create-organization" element={<CreateOrganization />} />
        <Route path="/join-organization" element={<JoinOrganization />} />
      </Route>

      {/* Authenticated Application Workspace (Requires Organization & Login) */}
      <Route element={<ProtectedRoute requireOrg={true} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/videos" element={<VideoLibrary />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/settings/organization" element={<OrganizationSettings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Backwards Compatibility Legacy Routes */}
      <Route path="/surveillance" element={<Navigate to="/dashboard" replace />} />
      <Route path="/cameras" element={<Navigate to="/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/user/dashboard" element={<Navigate to="/dashboard" replace />} />
      <Route path="/upload-video" element={<Navigate to="/upload" replace />} />
      <Route path="/user/upload" element={<Navigate to="/upload" replace />} />
      <Route path="/manage-users" element={<Navigate to="/team" replace />} />
      <Route path="/admin/profile" element={<Navigate to="/profile" replace />} />
      <Route path="/user/profile" element={<Navigate to="/profile" replace />} />

      {/* 404 Not Found Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
