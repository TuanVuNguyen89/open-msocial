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
  REGISTRATION: "/identity/users/registration",
  SEND_FRIEND_REQUEST: "/profile/relationship/send-friend-request/{receiverId}",
  GET_RELATIONSHIP: "/profile/relationship/get-relationship",
  CANCEL_FRIEND_REQUEST: "/profile/relationship/cancel-friend-request/{receiverId}",
  UPLOAD_MEDIA: "/media/upload",
  GET_MEDIA: "/media/{id}",
  DELETE_MEDIA: "/media/{id}",
  DOWNLOAD_MEDIA: "/media/download/{id}",
  VIEW_MEDIA: "/media/view/{id}",
  CREATE_POST: "/post/create",
  USER_POSTS: "/post/user-posts/{userId}",
  GET_POST_BY_ID: "/post/{postId}",
  UPDATE_POST: "/post/{postId}",
  DELETE_POST: "/post/{postId}",
  GET_FEED: "/post/get-feed",
  // Comment API endpoints
  CREATE_COMMENT: "/comment/create",
  UPDATE_COMMENT: "/comment/update/{id}",
  DELETE_COMMENT: "/comment/delete/{id}",
  GET_ROOT_COMMENT_BY_POST_ID: "/comment/post/{postId}/paginated",
  GET_REPLIES_BY_ROOT_COMMENT_ID: "/comment/root/{rootId}/paginated",
  GET_ALL_COMMENTS_BY_POST_ID: "/comment/post/{postId}/all/paginated",
  
  // User search API endpoint
  SEARCH_USER_BY_USERNAME: "/profile/users/search?username={username}"
};

export const OAuthConfig = {
  clientId: "350237683034-u8nbbb50l61a7j072mrnjgf8vgec63oe.apps.googleusercontent.com",
  redirectUri: "http://localhost:3000/authenticate",
  authUri: "https://accounts.google.com/o/oauth2/auth",
};
