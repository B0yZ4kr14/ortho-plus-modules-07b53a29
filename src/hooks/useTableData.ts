import { useState, useMemo } from 'react';

interface UseTableDataProps<T> {
  data: T[];
  searchFields?: (keyof T)[];
  initialPageSize?: number;
}

export function useTableData<T>({ data, searchFields = [], initialPageSize = 10 }: UseTableDataProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, searchFields]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    paginatedData,
    filteredData,
    totalPages,
    totalItems: filteredData.length,
  };
}
