import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onUpload: () => void;
  loading: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onUpload,
  loading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onImageSelect(file);
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 400,
          height: 300,
          border: '2px dashed #ccc',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <>
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              点击或拖拽图片到此处
            </Typography>
            <Typography variant="body2" color="text.secondary">
              支持 JPG、PNG 格式
            </Typography>
          </>
        )}
        <input
          accept="image/*"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
          type="file"
          onChange={handleFileSelect}
          disabled={loading}
        />
      </Box>

      {selectedFile && (
        <Typography variant="body2" color="text.secondary">
          已选择: {selectedFile.name}
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={onUpload}
        disabled={!selectedFile || loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? '上传中...' : '开始分析'}
      </Button>
    </Paper>
  );
};

export default ImageUpload; 