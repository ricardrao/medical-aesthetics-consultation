import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Layout from '../components/Layout';

interface AnalysisResult {
  facialFeatures: {
    skinCondition: string;
    facialSymmetry: string;
    facialProportions: string;
  };
  recommendations: {
    procedure: string;
    description: string;
    expectedOutcome: string;
  }[];
}

const Report: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = localStorage.getItem('analysisResult');
    if (storedResult) {
      setAnalysisResult(JSON.parse(storedResult));
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!analysisResult) {
    return null;
  }

  return (
    <Layout>
      <Box sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mb: 3 }}
        >
          返回首页
        </Button>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            面部特征分析报告
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                面部特征分析
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="皮肤状况"
                    secondary={analysisResult.facialFeatures.skinCondition}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="面部对称性"
                    secondary={analysisResult.facialFeatures.facialSymmetry}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="面部比例"
                    secondary={analysisResult.facialFeatures.facialProportions}
                  />
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                推荐医美项目
              </Typography>
              <List>
                {analysisResult.recommendations.map((rec, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={rec.procedure}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              项目说明：
                            </Typography>
                            {rec.description}
                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1 }}>
                              预期效果：
                            </Typography>
                            {rec.expectedOutcome}
                          </>
                        }
                      />
                    </ListItem>
                    {index < analysisResult.recommendations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              注：本报告仅供参考，具体治疗方案请咨询专业医生
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Report; 