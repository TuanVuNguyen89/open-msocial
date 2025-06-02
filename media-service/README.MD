# 💼️ Open MSocial - Media Feature

## 📌 Overview

The **Media Feature** allows users to upload, view, and manage media files (images, videos) in the Open MSocial platform. It provides functionality for attaching media to posts, viewing media in profiles, and handling media in the user interface.

## ⚙️ Technologies Used

- **Cloudinary SDK**: Client-side integration with Cloudinary services

## 🧩 Data Model

### `Media`
| Field             | Data Type    | Description                    |
|-------------------|--------------|--------------------------------|
| `id`              | string (UUID)| Primary key                    |
| `url`             | string       | Public URL to access the media |
| `publicId`        | string       | Public ID in Cloudinary        |
| `type`            | string       | Media type (image, video)      |
| `format`          | string       | File format (jpg, png, etc.)   |
| `size`            | number       | Size of the media in bytes     |
| `width`           | number       | Width of the media             |
| `height`          | number       | Height of the media            |
| `duration`        | number       | Duration for videos (seconds)  |
| `originalFilename`| string       | Original filename              |
| `userId`          | string       | ID of the user who uploaded    |
| `createdAt`       | Date         | Creation timestamp             |

## 🧩 Component Structure

### 1. MediaUploader
Component for uploading media files:
- File selection interface
- Preview of selected files
- Upload progress indicator
- Support for drag and drop

### 2. MediaViewer
Displays media content with:
- Responsive image/video display
- Lightbox for full-screen viewing
- Navigation controls for multiple media items
- Support for different media types

### 3. MediaGallery
Grid display of multiple media items:
- Thumbnail previews
- Lazy loading for performance
- Filtering and sorting options
- Selection functionality

## 📡 API Endpoints

### Media Management
- **POST** `/api/media/upload` - Upload new media file
- **GET** `/api/media/{mediaId}` - Get media details
- **DELETE** `/api/media/{mediaId}` - Delete media

### Media Queries
- **GET** `/api/media/user/{userId}` - Get media by user
- **GET** `/api/media/post/{postId}` - Get media associated with a post

## 🚀 Key Features

1. **Media upload** with drag-and-drop support
2. **Multiple file types** including images and videos
3. **Preview functionality** before uploading
4. **Responsive display** across different devices
5. **Gallery view** for browsing multiple media items
6. **Lightbox viewing** for full-screen media display
7. **Media management** including deletion and organization
8. **Integration with posts** for attaching media to content

## 🔄 Integration with Other Features

- **Authentication**: User authentication for media operations
- **Profile**: Displaying user media in profiles
- **Post**: Attaching media to posts
- **Comment**: Referencing media in comments