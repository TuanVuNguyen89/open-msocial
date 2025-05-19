import httpClient from "../configurations/httpClient";
import { API, CONFIG } from "../configurations/configuration";
import { getToken } from "./localStorageService";

/**
 * Upload media file to the server
 * @param {File} file - The file to upload
 * @returns {Promise<{data: {result: MediaUploadResponse}}>} - Promise with the upload response
 * 
 * @typedef {Object} MediaUploadResponse
 * @property {string} id - The ID of the uploaded media
 * @property {string} url - The URL of the uploaded media
 * @property {string} publicId - The public ID of the uploaded media
 * @property {string} type - The type of the uploaded media
 * @property {string} format - The format of the uploaded media
 * @property {number} size - The size of the uploaded media in bytes
 * @property {number} width - The width of the uploaded media
 * @property {number} height - The height of the uploaded media
 * @property {number} duration - The duration of the uploaded media (for videos)
 * @property {string} originalFilename - The original filename of the uploaded media
 * @property {string} userId - The ID of the user who uploaded the media
 * @property {string} createdAt - The timestamp when the media was created
 */
export const uploadMedia = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await httpClient.post(API.UPLOAD_MEDIA, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Get media by ID
 * @param {string} id - The ID of the media
 * @returns {Promise} - Promise with the media data
 */
export const getMediaById = async (id) => {
  return await httpClient.get(API.GET_MEDIA.replace("{id}", id), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * Delete media by ID
 * @param {string} id - The ID of the media to delete
 * @returns {Promise} - Promise with the deletion result
 */
export const deleteMedia = async (id) => {
  return await httpClient.delete(API.DELETE_MEDIA.replace("{id}", id), {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/**
 * Get download URL for media
 * @param {string} id - The ID of the media to download
 * @returns {string} - The download URL
 */
export const getDownloadUrl = (id) => {
  return `${CONFIG.API_GATEWAY}${API.DOWNLOAD_MEDIA.replace("{id}", id)}`;
};

/**
 * Get view URL for media
 * @param {string} id - The ID of the media to view
 * @returns {string} - The view URL
 */
export const getViewUrl = (id) => {
  return `${CONFIG.API_GATEWAY}${API.VIEW_MEDIA.replace("{id}", id)}`;
};

/**
 * Download media file
 * @param {string} id - The ID of the media to download
 */
export const downloadMedia = async (id) => {
  window.location.href = getDownloadUrl(id);
};

/**
 * View media file
 * @param {string} id - The ID of the media to view
 */
export const viewMedia = async (id) => {
  window.location.href = getViewUrl(id);
};
