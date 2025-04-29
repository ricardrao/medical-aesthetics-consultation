import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './styles/global.css';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadSuccess(false);
      setReport(null);
      setError(null);
    }
  };

  const handleSendImage = async () => {
    if (!selectedImage) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      console.log('Sending image to backend...');
      
      const response = await fetch('http://localhost:5000/api/Analysis/analyze', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(errorText || '上传失败，请稍后重试');
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (data && data.report) {
        setReport(data.report);
        setUploadSuccess(true);
      } else {
        throw new Error('服务器返回的数据格式不正确');
      }
    } catch (err) {
      console.error('Error sending image:', err);
      setError(err instanceof Error ? err.message : '上传失败，请稍后重试');
      setUploadSuccess(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setReport(null);
    setError(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Medical Aesthetics Consultation</h1>
      </header>
      <main>
        <div className="upload-section">
          <h2>Upload Patient Photo</h2>
          <p className="upload-description">
            Please upload a clear photo of the patient's face for consultation
          </p>
          
          {!selectedImage ? (
            <div className="upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                id="file-input"
              />
              <label htmlFor="file-input" className="file-label">
                <span className="upload-icon">📷</span>
                <span>Click to upload or drag and drop</span>
              </label>
            </div>
          ) : (
            <div className="preview-container">
              <img src={previewUrl || ''} alt="Preview" className="image-preview" />
              <div className="action-buttons">
                <button 
                  className="action-button send-button" 
                  onClick={handleSendImage}
                  disabled={isUploading}
                >
                  {isUploading ? 'Analyzing...' : 'Send for Analysis'}
                </button>
                <button 
                  className="action-button reset-button" 
                  onClick={handleReset}
                  disabled={isUploading}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          
          {uploadSuccess && !report && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <span>Image successfully sent for analysis!</span>
            </div>
          )}
          
          {report && (
            <div className="report-container">
              <h2 className="report-title">Analysis Report</h2>
              <div className="markdown-content">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App; 