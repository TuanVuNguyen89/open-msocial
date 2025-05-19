import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const getMyPosts = async (page) => {
  return await httpClient
    .get(API.MY_POST, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        page: page,
        size: 10,
      },
    });
};

export const getUserPosts = async (userId, page) => {
  return await httpClient.get(API.USER_POSTS.replace("{userId}", userId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      page: page,
      size: 10,
    },
  });
};

export const getPostById = async (postId) => {
  return await httpClient.get(API.GET_POST_BY_ID.replace("{postId}", postId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const updatePost = async (postId, post) => {
  return await httpClient.put(API.UPDATE_POST.replace("{postId}", postId), post, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const deletePost = async (postId) => {
  return await httpClient.delete(API.DELETE_POST.replace("{postId}", postId), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const getFeed = async (page) => {
  return await httpClient.get(API.GET_FEED, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      page: page,
      size: 10,
    },
  });
};

export const createPost = async (post) => {
  return await httpClient.post(API.CREATE_POST, post, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};