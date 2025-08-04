'use client'
import { useState, useRef, useCallback } from 'react'
import { 
  Camera, 
  Upload, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Shield,
  Loader
} from 'lucide-react'
import { usePhotoUpload, photoUploadManager, type PhotoUpload, type PhotoUploadOptions } from '@/lib/photo-upload'

interface PhotoUploadZoneProps {
  updateId: string
  teacherId: number
  onPhotosUploaded: (photos: PhotoUpload[]) => void
  maxPhotos?: number
  required?: boolean
  disabled?: boolean
}

export function PhotoUploadZone({ 
  updateId, 
  teacherId, 
  onPhotosUploaded, 
  maxPhotos = 5, 
  required = false,
  disabled = false 
}: PhotoUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(true)

  const {
    uploading,
    uploadProgress,
    uploadedPhotos,
    uploadPhotos,
    removePhoto,
    updatePhotoMetadata
  } = usePhotoUpload()

  const options: PhotoUploadOptions = {
    updateId,
    teacherId,
    maxPhotos
  }

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setValidationErrors([])

    try {
      const newPhotos = await uploadPhotos(fileArray, options)
      onPhotosUploaded(newPhotos)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setValidationErrors(errorMessage.split('; '))
    }
  }, [uploadPhotos, options, onPhotosUploaded])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setDragActive(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    // Reset input value so same file can be selected again
    e.target.value = ''
  }, [handleFileSelect])

  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleRemovePhoto = (photoId: string) => {
    removePhoto(photoId)
    // Notify parent component
    const remainingPhotos = uploadedPhotos.filter(photo => photo.id !== photoId)
    onPhotosUploaded(remainingPhotos)
  }

  const handleUpdateCaption = (photoId: string, caption: string) => {
    updatePhotoMetadata(photoId, { caption })
  }

  const canAddMore = uploadedPhotos.length < maxPhotos

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${disabled 
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
              : dragActive 
                ? 'border-begin-teal bg-begin-teal/5' 
                : 'border-begin-gray hover:border-begin-teal hover:bg-begin-teal/5'
            }
          `}
          onClick={openFileSelector}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
            className="sr-only"
            disabled={disabled}
          />

          {uploading ? (
            <div className="space-y-3">
              <Loader className="h-8 w-8 text-begin-teal mx-auto animate-spin" />
              <div>
                <p className="text-begin-blue font-medium">Uploading photos...</p>
                <p className="text-sm text-begin-blue/70">Processing and optimizing images</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <Camera className="h-8 w-8 text-begin-blue/50 mr-2" />
                <Upload className="h-8 w-8 text-begin-blue/50" />
              </div>
              
              <div>
                <p className="text-begin-blue font-medium">
                  Upload photos showing student engagement
                </p>
                <p className="text-sm text-begin-blue/70 mt-1">
                  Drop photos here or click to browse • Max {maxPhotos} photos • JPEG, PNG, WebP
                </p>
                <p className="text-xs text-begin-blue/50 mt-2">
                  Photos will require parent permission before being shared
                </p>
              </div>

              {!disabled && (
                <button
                  type="button"
                  className="btn-begin-secondary mx-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    openFileSelector()
                  }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Photos
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Upload Issues</h4>
              <ul className="mt-1 text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Photo Preview Grid */}
      {uploadedPhotos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-begin-blue">
              Uploaded Photos ({uploadedPhotos.length}/{maxPhotos})
            </h4>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-begin-teal hover:text-begin-teal-hover text-sm flex items-center gap-1"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          {showPreview && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {uploadedPhotos.map((photo) => (
                <PhotoPreviewCard
                  key={photo.id}
                  photo={photo}
                  onRemove={handleRemovePhoto}
                  onUpdateCaption={handleUpdateCaption}
                  disabled={disabled}
                />
              ))}
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-begin-teal/5 border border-begin-teal/20 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-begin-teal mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-begin-blue">Privacy Protection</h4>
                <p className="text-sm text-begin-blue/80 mt-1">
                  Before your update is sent, parents will be asked to give permission for these photos to be shared. 
                  They can preview all photos and decide which ones they're comfortable with.
                </p>
                <div className="mt-2 text-xs text-begin-blue/70">
                  <p>• All photos are automatically optimized and location data is removed</p>
                  <p>• Parents can revoke photo permissions at any time</p>
                  <p>• Photos are stored securely and only accessible to authorized users</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="bg-white border border-begin-gray rounded-lg p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-begin-blue">Uploading...</span>
                <span className="text-begin-blue/70">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-begin-teal h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Required Field Message */}
      {required && uploadedPhotos.length === 0 && (
        <p className="text-sm text-amber-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          At least one photo is required for this update type
        </p>
      )}
    </div>
  )
}

interface PhotoPreviewCardProps {
  photo: PhotoUpload
  onRemove: (photoId: string) => void
  onUpdateCaption: (photoId: string, caption: string) => void
  disabled?: boolean
}

function PhotoPreviewCard({ photo, onRemove, onUpdateCaption, disabled }: PhotoPreviewCardProps) {
  const [caption, setCaption] = useState(photo.caption || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveCaption = () => {
    onUpdateCaption(photo.id, caption)
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setCaption(photo.caption || '')
    setIsEditing(false)
  }

  return (
    <div className="bg-white border border-begin-gray rounded-lg overflow-hidden">
      <div className="relative aspect-square bg-gray-100">
        {/* In a real implementation, show actual image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Camera className="h-8 w-8 text-gray-400" />
        </div>
        
        {/* Remove button */}
        {!disabled && (
          <button
            onClick={() => onRemove(photo.id)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}

        {/* Permission status */}
        <div className="absolute bottom-2 left-2">
          {photo.parent_permission_granted ? (
            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Approved
            </div>
          ) : (
            <div className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Pending
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs text-begin-blue/70 mb-2">
          {photoUploadManager.formatFileSize(photo.file_size)} • {photo.mime_type.split('/')[1].toUpperCase()}
        </div>

        {/* Caption editor */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption..."
              className="w-full text-sm border border-begin-gray rounded px-2 py-1 focus:ring-1 focus:ring-begin-teal focus:border-transparent"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveCaption}
                className="text-xs bg-begin-teal text-white px-2 py-1 rounded hover:bg-begin-teal-hover"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {photo.caption ? (
              <p className="text-sm text-begin-blue mb-2">{photo.caption}</p>
            ) : (
              <p className="text-sm text-begin-blue/50 mb-2 italic">No caption</p>
            )}
            {!disabled && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-begin-teal hover:text-begin-teal-hover"
              >
                {photo.caption ? 'Edit caption' : 'Add caption'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}