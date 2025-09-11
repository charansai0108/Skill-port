/**
 * Firebase Storage Service
 * Handles file uploads, downloads, and management
 */

import { 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    getMetadata,
    updateMetadata
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import { storage } from './firebaseClient.js';

class StorageService {
    constructor() {
        this.storage = storage;
    }

    /**
     * Upload a file to Firebase Storage
     * @param {File} file - The file to upload
     * @param {string} path - The storage path (e.g., 'users/userId/profile.jpg')
     * @param {Object} metadata - Optional metadata for the file
     * @returns {Promise<Object>} Upload result with download URL
     */
    async uploadFile(file, path, metadata = {}) {
        try {
            // Validate file
            if (!file) {
                throw new Error('No file provided');
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('File size exceeds 10MB limit');
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'text/plain',
                'application/json'
            ];

            if (!allowedTypes.includes(file.type)) {
                throw new Error('File type not allowed');
            }

            // Create storage reference
            const storageRef = ref(this.storage, path);
            
            // Prepare metadata
            const uploadMetadata = {
                contentType: file.type,
                customMetadata: {
                    uploadedAt: new Date().toISOString(),
                    originalName: file.name,
                    ...metadata
                }
            };

            // Upload file
            const snapshot = await uploadBytes(storageRef, file, uploadMetadata);
            
            // Get download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            return {
                success: true,
                downloadURL,
                path: snapshot.ref.fullPath,
                metadata: {
                    name: snapshot.ref.name,
                    size: file.size,
                    contentType: file.type,
                    timeCreated: snapshot.metadata.timeCreated
                }
            };

        } catch (error) {
            console.error('Upload file error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Upload user profile image
     * @param {File} file - The image file
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadProfileImage(file, userId) {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const path = `users/${userId}/profile_${timestamp}.${fileExtension}`;
        
        return await this.uploadFile(file, path, {
            type: 'profile-image',
            userId: userId
        });
    }

    /**
     * Upload community image
     * @param {File} file - The image file
     * @param {string} communityId - Community ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadCommunityImage(file, communityId) {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const path = `communities/${communityId}/image_${timestamp}.${fileExtension}`;
        
        return await this.uploadFile(file, path, {
            type: 'community-image',
            communityId: communityId
        });
    }

    /**
     * Upload contest attachment
     * @param {File} file - The file
     * @param {string} contestId - Contest ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadContestAttachment(file, contestId, userId) {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const path = `contests/${contestId}/attachments/${userId}_${timestamp}.${fileExtension}`;
        
        return await this.uploadFile(file, path, {
            type: 'contest-attachment',
            contestId: contestId,
            userId: userId
        });
    }

    /**
     * Upload submission file
     * @param {File} file - The file
     * @param {string} submissionId - Submission ID
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Upload result
     */
    async uploadSubmissionFile(file, submissionId, userId) {
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const path = `submissions/${submissionId}/files/${userId}_${timestamp}.${fileExtension}`;
        
        return await this.uploadFile(file, path, {
            type: 'submission-file',
            submissionId: submissionId,
            userId: userId
        });
    }

    /**
     * Delete a file from Firebase Storage
     * @param {string} path - The storage path
     * @returns {Promise<Object>} Delete result
     */
    async deleteFile(path) {
        try {
            const storageRef = ref(this.storage, path);
            await deleteObject(storageRef);
            
            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            console.error('Delete file error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get file metadata
     * @param {string} path - The storage path
     * @returns {Promise<Object>} Metadata result
     */
    async getFileMetadata(path) {
        try {
            const storageRef = ref(this.storage, path);
            const metadata = await getMetadata(storageRef);
            
            return {
                success: true,
                metadata: {
                    name: metadata.name,
                    size: metadata.size,
                    contentType: metadata.contentType,
                    timeCreated: metadata.timeCreated,
                    updated: metadata.updated,
                    customMetadata: metadata.customMetadata
                }
            };
        } catch (error) {
            console.error('Get file metadata error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Update file metadata
     * @param {string} path - The storage path
     * @param {Object} newMetadata - New metadata
     * @returns {Promise<Object>} Update result
     */
    async updateFileMetadata(path, newMetadata) {
        try {
            const storageRef = ref(this.storage, path);
            await updateMetadata(storageRef, newMetadata);
            
            return {
                success: true,
                message: 'File metadata updated successfully'
            };
        } catch (error) {
            console.error('Update file metadata error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get download URL for a file
     * @param {string} path - The storage path
     * @returns {Promise<Object>} Download URL result
     */
    async getDownloadURL(path) {
        try {
            const storageRef = ref(this.storage, path);
            const downloadURL = await getDownloadURL(storageRef);
            
            return {
                success: true,
                downloadURL
            };
        } catch (error) {
            console.error('Get download URL error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate file before upload
     * @param {File} file - The file to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    validateFile(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'text/plain',
                'application/json'
            ]
        } = options;

        if (!file) {
            return { valid: false, error: 'No file provided' };
        }

        if (file.size > maxSize) {
            return { 
                valid: false, 
                error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit` 
            };
        }

        if (!allowedTypes.includes(file.type)) {
            return { 
                valid: false, 
                error: 'File type not allowed' 
            };
        }

        return { valid: true };
    }
}

// Create and export singleton instance
const storageService = new StorageService();
export default storageService;
