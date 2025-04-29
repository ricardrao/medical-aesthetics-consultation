import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box } from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import Layout from '../components/Layout';
import axios from 'axios';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      localStorage.setItem('analysisResult', JSON.stringify(response.data));
      navigate('/report');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('上传图片时发生错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            医美咨询系统
          </Typography>
          <Typography variant="body1" color="text.secondary">
            上传您的照片，获取个性化的医美建议
          </Typography>
        </Box>

        <ImageUpload
          onImageSelect={handleImageSelect}
          onUpload={handleUpload}
          loading={loading}
        />
      </Container>
    </Layout>
  );
};

export default Home; 