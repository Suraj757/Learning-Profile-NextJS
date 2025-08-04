// Photo Upload and Management System
// Handles secure file upload, storage, and privacy controls for parent updates

export interface PhotoUpload {
  id: string
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  caption?: string
  alt_text?: string
  display_order: number
  parent_permission_granted: boolean
  permission_requested_at?: Date
  permission_granted_at?: Date
  created_at: Date
}

export interface PhotoUploadOptions {
  updateId: string
  teacherId: number
  maxFileSize?: number // in bytes, default 5MB
  allowedTypes?: string[] // default: ['image/jpeg', 'image/png', 'image/webp']
  maxPhotos?: number // default: 5 per update
}

export interface PhotoPermissionRequest {
  updateId: string
  photoIds: string[]
  parentEmail: string
  studentName: string
  requestMessage?: string
}

class PhotoUploadManager {
  private maxFileSize = 5 * 1024 * 1024 // 5MB
  private allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  private maxPhotos = 5

  /**
   * Validate uploaded files before processing
   */
  validateFiles(files: File[], options?: Partial<PhotoUploadOptions>): { valid: File[], errors: string[] } {
    const maxSize = options?.maxFileSize || this.maxFileSize
    const allowedTypes = options?.allowedTypes || this.allowedTypes
    const maxCount = options?.maxPhotos || this.maxPhotos

    const valid: File[] = []
    const errors: string[] = []

    if (files.length > maxCount) {
      errors.push(`Maximum ${maxCount} photos allowed per update`)
      return { valid, errors }
    }

    for (const file of files) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, PNG, and WebP images are allowed`)
        continue
      }

      // Check file size
      if (file.size > maxSize) {
        errors.push(`${file.name}: File size must be less than ${this.formatFileSize(maxSize)}`)
        continue
      }

      // Check if it's actually an image
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: File must be an image`)
        continue
      }

      valid.push(file)
    }

    return { valid, errors }
  }

  /**
   * Generate secure file path for storage
   */
  generateFilePath(teacherId: number, updateId: string, filename: string): string {
    const timestamp = Date.now()
    const sanitizedFilename = this.sanitizeFilename(filename)
    return `teacher_${teacherId}/update_${updateId}/${timestamp}_${sanitizedFilename}`
  }

  /**
   * Sanitize filename for storage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Create optimized image for web display
   */
  async optimizeImage(file: File, maxWidth = 800, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Generate thumbnail for photo preview
   */
  async generateThumbnail(file: File, size = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        // Calculate crop dimensions for square thumbnail
        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  /**
   * Extract EXIF data and remove sensitive information
   */
  async stripExifData(file: File): Promise<Blob> {
    // For privacy, we should strip EXIF data which can contain location info
    const optimized = await this.optimizeImage(file)
    return optimized || file
  }

  /**
   * Check if parent permission is required for photos
   */
  requiresParentPermission(updateType: string): boolean {
    // All photos with identifiable students require permission
    return true
  }

  /**
   * Generate permission request message
   */
  generatePermissionMessage(studentName: string, photoCount: number): string {
    return `Hi! I'd love to share ${photoCount} photo${photoCount > 1 ? 's' : ''} showing ${studentName} engaged in learning activities. These photos demonstrate how I'm using ${studentName}'s learning profile to help them succeed. May I include these photos in your update? You can view them first before deciding.`
  }

  /**
   * Create photo upload metadata
   */
  createPhotoMetadata(file: File, options: PhotoUploadOptions, order: number): Omit<PhotoUpload, 'id' | 'created_at'> {
    return {
      filename: file.name,
      file_path: this.generateFilePath(options.teacherId, options.updateId, file.name),
      file_size: file.size,
      mime_type: file.type,
      display_order: order,
      parent_permission_granted: false,
      permission_requested_at: new Date(),
      alt_text: `Photo of student learning activity ${order + 1}`
    }
  }
}

// Export singleton instance
export const photoUploadManager = new PhotoUploadManager()

// React hook for photo upload functionality
export function usePhotoUpload() {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoUpload[]>([])

  const uploadPhotos = async (files: File[], options: PhotoUploadOptions) => {
    setUploading(true)
    const { valid, errors } = photoUploadManager.validateFiles(files, options)
    
    if (errors.length > 0) {
      throw new Error(errors.join('; '))
    }

    const results: PhotoUpload[] = []

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i]
      const fileId = `${file.name}_${Date.now()}`
      
      try {
        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        // Optimize image
        const optimizedBlob = await photoUploadManager.stripExifData(file)
        
        // Create metadata
        const metadata = photoUploadManager.createPhotoMetadata(file, options, i)
        
        // Simulate upload progress (replace with actual upload logic)
        for (let progress = 0; progress <= 100; progress += 20) {
          setUploadProgress(prev => ({ ...prev, [fileId]: progress }))
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // In a real implementation, upload to your storage service here
        // const uploadResult = await uploadToStorage(optimizedBlob, metadata.file_path)
        
        const photoUpload: PhotoUpload = {
          id: fileId,
          ...metadata,
          created_at: new Date()
        }

        results.push(photoUpload)
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error)
        throw error
      }
    }

    setUploadedPhotos(prev => [...prev, ...results])
    setUploading(false)
    setUploadProgress({})
    
    return results
  }

  const removePhoto = (photoId: string) => {
    setUploadedPhotos(prev => prev.filter(photo => photo.id !== photoId))
    // In a real implementation, also delete from storage
  }

  const updatePhotoMetadata = (photoId: string, updates: Partial<PhotoUpload>) => {
    setUploadedPhotos(prev => 
      prev.map(photo => 
        photo.id === photoId ? { ...photo, ...updates } : photo
      )
    )
  }

  return {
    uploading,
    uploadProgress,
    uploadedPhotos,
    uploadPhotos,
    removePhoto,
    updatePhotoMetadata,
    setUploadedPhotos
  }
}

// Privacy and consent utilities
export class PhotoPrivacyManager {
  /**
   * Generate consent form for parent permission
   */
  static generateConsentForm(photos: PhotoUpload[], studentName: string, teacherName: string) {
    return {
      title: `Photo Sharing Permission for ${studentName}`,
      description: `${teacherName} would like to share photos showing ${studentName} engaged in learning activities as part of their learning profile update.`,
      photos: photos.map(photo => ({
        id: photo.id,
        thumbnail: photo.file_path, // In real implementation, generate thumbnail URL
        caption: photo.caption || `Learning activity photo`,
        alt_text: photo.alt_text
      })),
      permissions: [
        {
          id: 'share_photos',
          label: 'I give permission to share these photos in my child\'s learning update',
          required: true
        },
        {
          id: 'future_photos',
          label: 'I give permission for future photos to be shared (can be revoked anytime)',
          required: false
        }
      ]
    }
  }

  /**
   * Process parent consent response
   */
  static processConsentResponse(photoIds: string[], permissions: Record<string, boolean>, parentEmail: string) {
    const consentData = {
      parentEmail,
      granted: permissions.share_photos || false,
      futurePhotosAllowed: permissions.future_photos || false,
      consentDate: new Date(),
      photoIds
    }

    // In a real implementation, save to database
    return consentData
  }

  /**
   * Check if photos can be displayed based on privacy settings
   */
  static canDisplayPhotos(photos: PhotoUpload[], parentEmail: string): boolean {
    return photos.every(photo => photo.parent_permission_granted)
  }
}

// Helper functions for storage integration
export async function uploadToStorage(blob: Blob, filePath: string): Promise<{ url: string, path: string }> {
  // This would integrate with your chosen storage provider
  // For example: Supabase Storage, AWS S3, Google Cloud Storage, etc.
  
  // Placeholder implementation
  const formData = new FormData()
  formData.append('file', blob)
  formData.append('path', filePath)

  try {
    const response = await fetch('/api/upload-photo', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const result = await response.json()
    return {
      url: result.url,
      path: result.path
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFromStorage(filePath: string): Promise<void> {
  try {
    await fetch('/api/delete-photo', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ path: filePath })
    })
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

// Types for React components
export interface PhotoUploadComponentProps {
  updateId: string
  teacherId: number
  onPhotosUploaded: (photos: PhotoUpload[]) => void
  maxPhotos?: number
  required?: boolean
}

export interface PhotoPermissionProps {
  photos: PhotoUpload[]
  studentName: string
  teacherName: string
  parentEmail: string
  onPermissionGranted: (photoIds: string[], permissions: Record<string, boolean>) => void
}