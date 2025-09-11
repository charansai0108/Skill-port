const admin = require('firebase-admin');

const storage = admin.storage();
const bucket = storage.bucket();

/**
 * Storage helper functions for server-side operations
 */
class StorageHelper {
    
    /**
     * Generate a signed URL for file access
     * @param {string} filePath - Path to the file in storage
     * @param {Object} options - Options for signed URL
     * @returns {Promise<string>} Signed URL
     */
    static async generateSignedURL(filePath, options = {}) {
        try {
            const {
                action = 'read',
                expires = Date.now() + 15 * 60 * 1000, // 15 minutes
                contentType = 'application/octet-stream'
            } = options;

            const file = bucket.file(filePath);
            
            const [signedUrl] = await file.getSignedUrl({
                action,
                expires,
                contentType
            });

            return signedUrl;
        } catch (error) {
            console.error('Error generating signed URL:', error);
            throw error;
        }
    }

    /**
     * Move a file to a new location
     * @param {string} sourcePath - Current file path
     * @param {string} destinationPath - New file path
     * @returns {Promise<void>}
     */
    static async moveFile(sourcePath, destinationPath) {
        try {
            const sourceFile = bucket.file(sourcePath);
            const destinationFile = bucket.file(destinationPath);

            await sourceFile.move(destinationFile);
            console.log(`File moved from ${sourcePath} to ${destinationPath}`);
        } catch (error) {
            console.error('Error moving file:', error);
            throw error;
        }
    }

    /**
     * Copy a file to a new location
     * @param {string} sourcePath - Source file path
     * @param {string} destinationPath - Destination file path
     * @returns {Promise<void>}
     */
    static async copyFile(sourcePath, destinationPath) {
        try {
            const sourceFile = bucket.file(sourcePath);
            const destinationFile = bucket.file(destinationPath);

            await sourceFile.copy(destinationFile);
            console.log(`File copied from ${sourcePath} to ${destinationPath}`);
        } catch (error) {
            console.error('Error copying file:', error);
            throw error;
        }
    }

    /**
     * Delete a file from storage
     * @param {string} filePath - Path to the file
     * @returns {Promise<void>}
     */
    static async deleteFile(filePath) {
        try {
            const file = bucket.file(filePath);
            await file.delete();
            console.log(`File deleted: ${filePath}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    /**
     * Get file metadata
     * @param {string} filePath - Path to the file
     * @returns {Promise<Object>} File metadata
     */
    static async getFileMetadata(filePath) {
        try {
            const file = bucket.file(filePath);
            const [metadata] = await file.getMetadata();
            return metadata;
        } catch (error) {
            console.error('Error getting file metadata:', error);
            throw error;
        }
    }

    /**
     * Update file metadata
     * @param {string} filePath - Path to the file
     * @param {Object} metadata - New metadata
     * @returns {Promise<void>}
     */
    static async updateFileMetadata(filePath, metadata) {
        try {
            const file = bucket.file(filePath);
            await file.setMetadata(metadata);
            console.log(`File metadata updated: ${filePath}`);
        } catch (error) {
            console.error('Error updating file metadata:', error);
            throw error;
        }
    }

    /**
     * List files in a directory
     * @param {string} directoryPath - Directory path
     * @param {Object} options - List options
     * @returns {Promise<Array>} List of files
     */
    static async listFiles(directoryPath, options = {}) {
        try {
            const {
                maxResults = 1000,
                pageToken = null,
                delimiter = '/'
            } = options;

            const [files] = await bucket.getFiles({
                prefix: directoryPath,
                maxResults,
                pageToken,
                delimiter
            });

            return files.map(file => ({
                name: file.name,
                size: file.metadata.size,
                contentType: file.metadata.contentType,
                timeCreated: file.metadata.timeCreated,
                updated: file.metadata.updated
            }));
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    }

    /**
     * Clean up old files
     * @param {string} directoryPath - Directory to clean
     * @param {number} maxAge - Maximum age in milliseconds
     * @returns {Promise<number>} Number of files deleted
     */
    static async cleanupOldFiles(directoryPath, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
        try {
            const files = await this.listFiles(directoryPath);
            const cutoffTime = Date.now() - maxAge;
            let deletedCount = 0;

            for (const file of files) {
                const fileTime = new Date(file.timeCreated).getTime();
                if (fileTime < cutoffTime) {
                    await this.deleteFile(file.name);
                    deletedCount++;
                }
            }

            console.log(`Cleaned up ${deletedCount} old files from ${directoryPath}`);
            return deletedCount;
        } catch (error) {
            console.error('Error cleaning up old files:', error);
            throw error;
        }
    }

    /**
     * Generate upload URL for direct client uploads
     * @param {string} filePath - Path where file will be uploaded
     * @param {Object} options - Upload options
     * @returns {Promise<Object>} Upload URL and metadata
     */
    static async generateUploadURL(filePath, options = {}) {
        try {
            const {
                expires = Date.now() + 60 * 60 * 1000, // 1 hour
                contentType = 'application/octet-stream',
                maxSize = 10 * 1024 * 1024 // 10MB
            } = options;

            const file = bucket.file(filePath);
            
            const [uploadUrl] = await file.getSignedUrl({
                action: 'write',
                expires,
                contentType,
                extensionHeaders: {
                    'Content-Length': maxSize.toString()
                }
            });

            return {
                uploadUrl,
                filePath,
                expires,
                maxSize
            };
        } catch (error) {
            console.error('Error generating upload URL:', error);
            throw error;
        }
    }

    /**
     * Validate file access permissions
     * @param {string} filePath - Path to the file
     * @param {string} userId - User ID requesting access
     * @returns {Promise<boolean>} Whether user has access
     */
    static async validateFileAccess(filePath, userId) {
        try {
            // Extract user ID from file path
            const pathParts = filePath.split('/');
            
            // Check if file belongs to user
            if (pathParts[0] === 'users' && pathParts[1] === userId) {
                return true;
            }
            
            // Check if file is in a community the user belongs to
            if (pathParts[0] === 'communities') {
                const communityId = pathParts[1];
                // You would check if user is member of this community
                // This is a simplified check
                return true;
            }
            
            // Check if file is in a contest the user participates in
            if (pathParts[0] === 'contests') {
                const contestId = pathParts[1];
                // You would check if user participates in this contest
                // This is a simplified check
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error validating file access:', error);
            return false;
        }
    }
}

module.exports = StorageHelper;
