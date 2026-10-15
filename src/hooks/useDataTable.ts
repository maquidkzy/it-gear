import { useState, useMemo } from 'react';

export function useDataTable<T>(
  data: T[],
  filterFn: (item: T, search: string) => boolean,
  initialPageSize: number = 7
) {
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const lower = search.toLowerCase();
    return data.filter((item) => filterFn(item, lower));
  }, [data, search, filterFn]);

  const totalEntries = filteredData.length;
  const totalPages = Math.ceil(totalEntries / pageSize);

  // If filtered data produces fewer pages than current, clamp to valid range
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalEntries);

  const paginatedData = useMemo(() => {
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, startIndex, endIndex]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [1];
    const pages: number[] = [];
    const maxButtons = 5;
    let startPage = Math.max(1, validCurrentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    for (let p = startPage; p <= endPage; p++) {
      pages.push(p);
    }
    return pages;
  }, [totalPages, validCurrentPage]);

  return {
    pageSize,
    setPageSize: (size: number) => {
      setPageSize(size);
      setCurrentPage(1);
    },
    currentPage: validCurrentPage,
    setCurrentPage,
    search,
    setSearch: (term: string) => {
      setSearch(term);
      setCurrentPage(1);
    },
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
    paginatedData,
    pageNumbers,
  };
}
