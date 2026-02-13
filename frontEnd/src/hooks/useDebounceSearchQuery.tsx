import { useState, useEffect, useRef, useCallback } from "react";

interface UseDebounceSearchQueryOptions {
  delay?: number;
  onPageReset?: () => void;
}

interface UseDebounceSearchQueryReturn {
  searchValue: string;
  debouncedSearchValue: string;
  setSearchValue: (value: string) => void;
  resetSearch: () => void;
}

export const useDebounceSearchQuery = (
  options: UseDebounceSearchQueryOptions = {}
): UseDebounceSearchQueryReturn => {
  const { delay = 500, onPageReset } = options;

  const [searchValue, setSearchValue] = useState<string>("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>("");
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSearch = useCallback(() => {
    setSearchValue("");
    setDebouncedSearchValue("");
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      if (searchValue !== debouncedSearchValue && onPageReset) {
        onPageReset();
      }
    }, delay);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchValue, debouncedSearchValue, delay, onPageReset]);

  return {
    searchValue,
    debouncedSearchValue,
    setSearchValue,
    resetSearch,
  };
};
