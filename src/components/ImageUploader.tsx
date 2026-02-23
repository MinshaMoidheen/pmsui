'use client'

// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 5

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const UploadZone = styled(Box, {
  shouldForwardProp: prop => prop !== '$isDragOver'
})<{ $isDragOver?: boolean }>(({ theme, $isDragOver }) => ({
  border: `2px dashed ${$isDragOver ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2, 3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'border-color 0.2s, background-color 0.2s',
  backgroundColor: $isDragOver ? theme.palette.action.hover : 'transparent',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.action.hover
  }
}))

interface ImageUploaderProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
}

const ImageUploader = ({ value, onChange, maxImages = 10, disabled = false }: ImageUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const processFiles = async (files: FileList | null) => {
    if (!files?.length) return

    const validFiles: File[] = []
    const errors: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid type. Use JPG, PNG, WebP or GIF.`)
        continue
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: Max size ${MAX_SIZE_MB}MB.`)
        continue
      }
      validFiles.push(file)
    }

    if (errors.length > 0) {
      console.warn('Image upload warnings:', errors)
    }

    const remaining = maxImages - value.length
    const toAdd = validFiles.slice(0, remaining)

    if (toAdd.length === 0) return

    const base64Urls = await Promise.all(toAdd.map(fileToBase64))
    onChange([...value, ...base64Urls])
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (disabled) return
    processFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleClick = () => inputRef.current?.click()

  const canAddMore = value.length < maxImages

  return (
    <Box>
      <input
        ref={inputRef}
        type='file'
        accept={ACCEPTED_TYPES.join(',')}
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {canAddMore && (
        <UploadZone
          $isDragOver={isDragOver}
          onClick={disabled ? undefined : handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{ opacity: disabled ? 0.5 : 1 }}
        >
          <i className='ri-image-add-line text-4xl text-textSecondary mbe-2' />
          <Typography variant='body2' fontSize='0.8125rem' color='text.secondary'>
            Click or drag images here
          </Typography>
          <Typography variant='caption' fontSize='0.75rem' color='text.disabled'>
            JPG, PNG, WebP, GIF — max {MAX_SIZE_MB}MB. Up to {maxImages} images.
          </Typography>
        </UploadZone>
      )}

      {value.length > 0 && (
        <Box className='flex flex-wrap gap-3 mt-4'>
          {value.map((url, index) => (
            <Box
              key={index}
              sx={{
                position: 'relative',
                width: 100,
                height: 100,
                borderRadius: 1,
                overflow: 'hidden',
                border: theme => `1px solid ${theme.palette.divider}`
              }}
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {!disabled && (
                <IconButton
                  size='small'
                  onClick={() => handleRemove(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <i className='ri-close-line' />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}

      {value.length > 0 && (
        <Typography variant='caption' color='text.disabled' className='block mt-2'>
          {value.length} image(s) selected
        </Typography>
      )}
    </Box>
  )
}

export default ImageUploader
