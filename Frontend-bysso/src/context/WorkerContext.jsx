import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import {
  getWorkers,
  createWorker,
  updateWorker,
  deleteWorker,
} from '../services/workersService';

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkers = useCallback(async (activo = undefined, searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getWorkers(activo, searchQuery);
      setWorkers(response.data);
      return response.data; // Return data for immediate use if needed
    } catch (err) {
      setError(err);
      console.error('Error fetching workers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addWorker = useCallback(async (workerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createWorker(workerData);
      // Assuming the backend returns the newly created worker, add it to the state
      setWorkers((prevWorkers) => [...prevWorkers, response.data]);
      return response.data;
    } catch (err) {
      setError(err);
      console.error('Error creating worker:', err);
      throw err; // Re-throw to allow component to handle specific errors (e.g., duplicate name)
    } finally {
      setLoading(false);
    }
  }, []);

  const editWorker = useCallback(async (id, workerData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateWorker(id, workerData);
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker.id === id ? { ...worker, ...response.data } : worker
        )
      );
      return response.data;
    } catch (err) {
      setError(err);
      console.error('Error updating worker:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeWorker = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteWorker(id);
      setWorkers((prevWorkers) => prevWorkers.filter((worker) => worker.id !== id));
    } catch (err) {
      setError(err);
      console.error('Error deleting worker:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch of active workers when the provider mounts
  useEffect(() => {
    fetchWorkers(true); // Fetch active workers by default for dropdowns etc.
  }, [fetchWorkers]);

  const value = {
    workers,
    loading,
    error,
    fetchWorkers,
    addWorker,
    editWorker,
    removeWorker,
  };

  return (
    <WorkerContext.Provider value={value}>{children}</WorkerContext.Provider>
  );
};

export const useWorkers = () => {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkerProvider');
  }
  return context;
};
