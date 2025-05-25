import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const createComment = async (comment) => {
    return await httpClient.post(API.CREATE_COMMENT, comment, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const updateComment = async (comment) => {
    return await httpClient.put(API.UPDATE_COMMENT.replace("{id}", comment.id), comment, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const deleteComment = async (commentId) => {
    return await httpClient.delete(API.DELETE_COMMENT.replace("{id}", commentId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const getRootCommentByPostId = async (postId) => {
    return await httpClient.get(API.GET_ROOT_COMMENT_BY_POST_ID.replace("{postId}", postId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const getRepliesByRootCommentId = async (rootId) => {
    return await httpClient.get(API.GET_REPLIES_BY_ROOT_COMMENT_ID.replace("{rootId}", rootId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const getAllCommentsByPostId = async (postId, page = 0, size = 10) => {
    return await httpClient.get(API.GET_ALL_COMMENTS_BY_POST_ID.replace("{postId}", postId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        page,
        size
      }
    });
};
