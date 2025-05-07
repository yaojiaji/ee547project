import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { MealSubmission } from '../components/MealSubmission';

const FoodLogging: React.FC = () => {
  // 这里应该从用户认证系统中获取实际的userId
  const userId = "user123"; // 临时使用固定值，实际应用中应该从认证系统获取

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Food Logging
        </Typography>
        
        <MealSubmission userId={userId} />
      </Box>
    </Container>
  );
};

export default FoodLogging; 