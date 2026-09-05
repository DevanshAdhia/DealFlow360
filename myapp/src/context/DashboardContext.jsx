import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchDashboard, updateResource } from '../services/api.js';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDashboard();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Update a specific section of the dashboard (e.g. 'baseStats', 'activities')
  const updateDashboardSection = async (sectionKey, data) => {
    try {
      // The server.js patch for single objects updates the whole object partially.
      // So updating a nested key means we send an object with that key.
      const updated = await updateResource('dashboard', sectionKey, data);
      
      // We need to re-fetch or merge manually. 
      // The custom server replaces the specific key in the dashboard object.
      // E.g., PATCH /api/dashboard/baseStats
      setDashboardData(prev => ({
        ...prev,
        [sectionKey]: updated
      }));
      return updated;
    } catch (err) {
      console.error('Failed to update dashboard section:', err);
      throw err;
    }
  };

  return (
    <DashboardContext.Provider value={{ dashboardData, isLoading, error, updateDashboardSection, reloadDashboard: loadDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
