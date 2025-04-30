import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImageUpload: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setError(null); // 清除之前的错误
        setAnalysisResult(null); // 清除之前的结果
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    try {
      // 移除 data:image/jpeg;base64, 前缀
      const base64Data = selectedImage.split(',')[1];
      
      console.log('Sending request to backend...');
      const response = await fetch('http://localhost:5000/api/ImageAnalysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          imageData: base64Data,
          systemPrompt: "请分析这张照片中的面部特征，包括皮肤状况、皱纹、色斑等，并提供专业的医美建议。"
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || '分析失败');
      }

      if (data.success) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error(data.error || '分析失败');
      }
    } catch (error) {
      console.error('分析错误:', error);
      setError(error instanceof Error ? error.message : '分析过程中出现错误，请重试。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          上传照片进行分析
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mb: 3 }}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={handleUploadClick}
          >
            选择照片
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
            />
          </Button>

          {selectedImage && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img
                src={selectedImage}
                alt="Selected"
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
              />
            </Box>
          )}

          {selectedImage && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              sx={{ mt: 2 }}
            >
              {isAnalyzing ? <CircularProgress size={24} /> : '开始分析'}
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {analysisResult && (
          <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              分析结果
            </Typography>
            <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
              {analysisResult}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Box>
  );
};

export default ImageUpload; 