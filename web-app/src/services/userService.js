import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import { getToken } from "./localStorageService";

export const getMyInfo = async () => {
  return await httpClient
    .get(API.MY_INFO, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const updateProfile = async (user) => {
    return await httpClient.put(API.UPDATE_PROFILE.replace("{id}", user.id), user, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const getMyFriends = async (page) => {
    return await httpClient.get(API.GET_MY_FRIENDS, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        page: page.number ?? 0,
        size: page.size ?? 10,
      },
    });
};

export const getPendingRequests = async (page) => {
    return await httpClient.get(API.GET_PENDING_REQUESTS, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      params: {
        page: page.number ?? 0,
        size: page.size ?? 10,
      },
    });
};

export const acceptFriendRequest = async (receiverId) => {
    return await httpClient.post(
      API.ACCEPT_FRIEND_REQUEST.replace("{receiverId}", receiverId), 
      {}, // Empty body or you can add body data here if needed
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
};

export const rejectFriendRequest = async (senderId) => {
    return await httpClient.post(
      API.REJECT_FRIEND_REQUEST.replace("{senderId}", senderId), 
      {}, // Empty body or you can add body data here if needed
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
};

export const getProfile = async (id) => {
    return await httpClient.get(API.GET_PROFILE.replace("{id}", id), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
}

export const removeFriend = async (friendId) => {
    return await httpClient.delete(API.REMOVE_FRIEND.replace("{friendId}", friendId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const listFriends = async (userId) => {
    return await httpClient.get(API.LIST_FRIENDS.replace("{userId}", userId), {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
};

export const registration = async (request) => {
    return await httpClient.post(API.REGISTRATION, {
      username: request.username,
      password: request.password,
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      dob: request.dob,
      city: request.city
    });
}

export const sendFriendRequest = async (receiverId) => {
    return await httpClient.post(
      API.SEND_FRIEND_REQUEST.replace("{receiverId}", receiverId), 
      {}, // Empty body or you can add body data here if needed
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
};

export const areFriend = async (userId1, userId2) => {
  return await httpClient.get(API.GET_RELATIONSHIP, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    params: {
      userId1,
      userId2,
    },
  });
};

export const cancelFriendRequest = async (receiverId) => {
    return await httpClient.post(
      API.CANCEL_FRIEND_REQUEST.replace("{receiverId}", receiverId), 
      {}, // Empty body or you can add body data here if needed
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
};

// Hàm mới để tìm kiếm người dùng theo username
export const searchUserByUsername = async (username) => {
    return await httpClient.get(
      API.SEARCH_USER_BY_USERNAME.replace("{username}", username),
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        }
      }
    );
};