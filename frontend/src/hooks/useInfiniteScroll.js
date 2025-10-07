import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (callback, hasMore) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching || !hasMore) return;
    fetchMoreData();
  }, [isFetching, hasMore]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // Check if we're near the bottom (within 200px)
    if (scrollTop + clientHeight >= scrollHeight - 200 && hasMore) {
      setIsFetching(true);
    }
  };

  const fetchMoreData = useCallback(async () => {
    try {
      await callback();
    } catch (error) {
      console.error('Error fetching more data:', error);
    } finally {
      setIsFetching(false);
    }
  }, [callback]);

  return [isFetching, setIsFetching];
};