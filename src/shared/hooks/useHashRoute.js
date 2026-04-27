import { useEffect, useState } from "react";

const readHash = () => window.location.hash.slice(1) || "card";

export function useHashRoute() {
  const [page, setPageState] = useState(readHash);

  useEffect(() => {
    const handleHashChange = () => {
      setPageState(readHash());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const setPage = (nextPage) => {
    window.location.hash = nextPage;
    setPageState(nextPage);
  };

  return { page, setPage };
}
