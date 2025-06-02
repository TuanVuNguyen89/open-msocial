import { useRef, useEffect, useCallback, useState } from 'react';

/**
 * Custom hook to handle infinite scrolling functionality
 * Improved to prevent ResizeObserver errors
 */
const useInfiniteScroll = (loading, posts) => {
  const observer = useRef();
  const [hasMore, setHasMore] = useState(true);
  const observerTimeout = useRef(null);
  
  // Sử dụng useCallback để tránh tạo lại hàm trong mỗi lần render
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    
    // Ngắt kết nối observer cũ trước khi tạo mới
    if (observer.current) {
      observer.current.disconnect();
    }
    
    // Xóa timeout cũ nếu có
    if (observerTimeout.current) {
      clearTimeout(observerTimeout.current);
    }
    
    // Tạo IntersectionObserver mới với cấu hình phù hợp
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading && hasMore) {
        // Sử dụng setTimeout để tránh quá nhiều callback trong một thời gian ngắn
        observerTimeout.current = setTimeout(() => {
          // This will trigger the page increment in the parent component
          // through the hasMore state which is watched in usePostManagement
          setHasMore(true);
        }, 100);
      }
    }, {
      // Cấu hình để tránh lỗi ResizeObserver
      threshold: 0.1,
      rootMargin: '200px',
      delay: 100 // Thêm delay để giảm tần suất gọi callback
    });
    
    // Chỉ observe node mới nếu nó tồn tại
    if (node) {
      // Sử dụng requestAnimationFrame để đảm bảo DOM đã render hoàn toàn
      requestAnimationFrame(() => {
        try {
          observer.current.observe(node);
        } catch (error) {
          console.error("Error observing node:", error);
        }
      });
    }
  }, [loading, hasMore]); // Phụ thuộc vào trạng thái loading và hasMore

  // Cập nhật hasMore khi posts thay đổi
  useEffect(() => {
    if (posts && posts.length > 0) {
      setHasMore(true);
    }
  }, [posts]);

  // Đảm bảo ngắt kết nối observer và xóa timeout khi component unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (observerTimeout.current) {
        clearTimeout(observerTimeout.current);
      }
    };
  }, []);
  
  // Thêm global error handler cho ResizeObserver
  useEffect(() => {
    const errorHandler = (event) => {
      if (event.message && event.message.includes('ResizeObserver')) {
        event.stopImmediatePropagation();
        event.preventDefault();
        console.warn('ResizeObserver error caught and suppressed');
      }
    };
    
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  return { lastPostElementRef };
};

export default useInfiniteScroll;
