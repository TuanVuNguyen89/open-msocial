export const CONFIG = {
  API_GATEWAY: "http://localhost:8888/api/v1",
};

export const API = {
  LOGIN: "/identity/auth/token",
  MY_INFO: "/profile/users/my-profile",
  GET_PROFILE: "/profile/users/{id}",
  MY_POST: "/post/my-posts",
  UPDATE_PROFILE: "/profile/users/{id}",
  GET_MY_FRIENDS: "/profile/relationship/my-friends",
  GET_PENDING_REQUESTS: "/profile/relationship/pending-requests",
  ACCEPT_FRIEND_REQUEST: "/profile/relationship/accept-friend-request/{receiverId}",
  REJECT_FRIEND_REQUEST: "/profile/relationship/reject-friend-request/{senderId}",
  REMOVE_FRIEND: "/profile/relationship/remove-friend/{friendId}",
  LIST_FRIENDS: "/profile/relationship/friends/{userId}",
  REGISTRATION: "/identity/users/registration"
};
