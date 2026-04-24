import { useState, useCallback } from 'react';

export const useApiStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((err) => {
    setError(err);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    setLoading,
    setError: setErrorState,
    clearError,
  };
};