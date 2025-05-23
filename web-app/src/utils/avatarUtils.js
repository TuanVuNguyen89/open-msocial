/**
 * Utility functions for handling avatar URLs from different sources
 */

/**
 * Validates and formats avatar URLs from different sources
 * Currently supports:
 * - Cloudinary URLs (http://res.cloudinary.com/...)
 * - Google profile pictures (https://lh3.googleusercontent.com/...)
 * - Other valid image URLs
 * 
 * @param {string} url - The avatar URL to validate and format
 * @returns {string} - The validated and formatted URL, or null if invalid
 */
export const formatAvatarUrl = (url) => {
  if (!url) return null;

  // Check if it's a valid URL
  try {
    new URL(url);
  } catch (e) {
    console.warn("Invalid avatar URL:", url);
    return null;
  }

  // Handle Cloudinary URLs
  if (url.includes('res.cloudinary.com')) {
    return url; // Already in correct format
  }

  // Handle Google profile pictures
  if (url.includes('googleusercontent.com')) {
    // Google URLs are already in correct format
    return url;
  }

  // For other URLs, just return as is if they appear to be valid image URLs
  if (url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) || 
      url.includes('/image/') || 
      url.includes('/avatar/')) {
    return url;
  }

  // If we can't determine the format, return the URL as is
  return url;
};

/**
 * Gets the initials from a user object for avatar fallback
 * 
 * @param {Object} user - User object with firstName, lastName, and username properties
 * @returns {string} - User's initials or first character of username
 */
export const getUserInitials = (user) => {
  if (!user) return '?';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
  
  if (user.firstName) {
    return user.firstName.charAt(0);
  }
  
  if (user.username) {
    return user.username.charAt(0);
  }
  
  return '?';
};
