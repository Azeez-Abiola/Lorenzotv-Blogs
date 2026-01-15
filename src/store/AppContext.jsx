import React, { useCallback, useEffect, useState } from "react";

import jwt from "jwt-decode";

export const AppContext = React.createContext({
  isLoggedIn: false,
  user: {},
  postsPerPage: [],
  totalPosts: 0,
  updateLoggedInState: (data) => { },
  updatePostsPerPage: (posts) => { },
  updateTotalPosts: (posts) => { },
});

const AppContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLogggedIn] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);
  const [postsPerPage, setPostsPerPage] = useState([]);
  const [showNewsletterModal, setShowNewsletterModal] = useState(false);

  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    const token = getCookie("jwt");
    if (token) {
      try {
        const decoded = jwt(token);
        if (!decoded || typeof decoded !== 'object') throw new Error("Invalid token structure");

        const currentDate = new Date();
        if (decoded.exp * 1000 > currentDate.getTime()) {
          setIsLogggedIn(true);
        } else {
          setIsLogggedIn(false);
        }
      } catch (error) {
        console.error("JWT Decode Error:", error.message);
        setIsLogggedIn(false);
      }
    } else {
      setIsLogggedIn(false);
    }
  }, [setIsLogggedIn]);

  const updateLoggedInState = useCallback((data) => {
    setIsLogggedIn(data);
  }, []);

  const updatePostsPerPage = useCallback((posts) => {
    setPostsPerPage(posts);
  }, []);

  const updateTotalPosts = useCallback((totalPosts) => {
    setTotalPosts(totalPosts);
  }, []);

  const data = {
    isLoggedIn,
    postsPerPage,
    totalPosts,
    updateTotalPosts,
    updateLoggedInState,
    updatePostsPerPage,
    showNewsletterModal,
    setShowNewsletterModal,
  };
  return <AppContext.Provider value={data}>{children}</AppContext.Provider>;
};
export default AppContextProvider;
