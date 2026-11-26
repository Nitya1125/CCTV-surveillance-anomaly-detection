import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requireOrg = true }) => {
  const token = localStorage.getItem("token");
  const orgId = localStorage.getItem("org_id");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If route requires an organization and user hasn't set one up yet, redirect to org onboarding
  if (requireOrg && (!orgId || orgId === "null" || orgId === "undefined")) {
    return <Navigate to="/organization" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
