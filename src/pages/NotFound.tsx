
import React from "react";
import { useLocation, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { HomeIcon } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <PageLayout>
      <div className="container flex flex-col items-center justify-center py-24">
        <h1 className="text-6xl font-bold text-civic-blue mb-6">404</h1>
        <p className="text-2xl text-civic-gray-700 mb-8">Page not found</p>
        <p className="text-civic-gray-600 mb-8 text-center max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <NavLink 
          to="/" 
          className="btn-primary flex items-center"
        >
          <HomeIcon className="w-4 h-4 mr-2" /> Return to Home
        </NavLink>
      </div>
    </PageLayout>
  );
};

export default NotFound;
