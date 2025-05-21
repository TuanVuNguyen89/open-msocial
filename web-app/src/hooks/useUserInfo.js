import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyInfo } from '../services/userService';
import { logOut, isAuthenticated } from '../services/authenticationService';

/**
 * Custom hook to fetch and manage user information
 */
const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Only fetch user info if the user is authenticated
    if (isAuthenticated()) {
      fetchUserInfo();
    } else {
      setLoadingUserInfo(false);
    }
  }, []);

  const fetchUserInfo = () => {
    setLoadingUserInfo(true);
    getMyInfo()
      .then(response => {
        setUserInfo(response.data.result);
        console.log("User info loaded:", response.data.result);
      })
      .catch(error => {
        console.error("Error loading user info:", error);
        if (error.response && error.response.status === 401) {
          logOut();
          navigate("/login");
        }
      })
      .finally(() => {
        setLoadingUserInfo(false);
      });
  };

  return { userInfo, loadingUserInfo, fetchUserInfo };
};

export default useUserInfo;
