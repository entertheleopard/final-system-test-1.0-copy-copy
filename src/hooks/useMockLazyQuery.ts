import { useState } from 'react';
import { mockDelay } from '@/utils/mockMode';

type UseLazyQueryResult<TData, TFilters> = {
  query(id?: string | TFilters): Promise<TData[] | TData>;
};

export function useMockLazyQuery<TData, TFilters>(
  entityName: string
): UseLazyQueryResult<TData, TFilters> {
  const query = async (params?: string | TFilters): Promise<TData[] | TData> => {
    await mockDelay();
    // Return empty array or null based on query type
    if (typeof params === 'string') {
      return null as TData;
    }
    return [] as TData[];
  };

  return { query };
}
