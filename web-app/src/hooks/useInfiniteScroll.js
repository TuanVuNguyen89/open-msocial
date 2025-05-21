import { useRef, useEffect } from 'react';

/**
 * Custom hook to handle infinite scrolling functionality
 */
const useInfiniteScroll = (loading, posts) => {
  const observer = useRef();
  const lastPostElementRef = useRef();

  useEffect(() => {
    if (loading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading) {
        // This will trigger the page increment in the parent component
        // through the hasMore state which is watched in usePostManagement
      }
    });
    
    if (lastPostElementRef.current) {
      observer.current.observe(lastPostElementRef.current);
    }
  }, [loading, posts]);

  return { lastPostElementRef };
};

export default useInfiniteScroll;
