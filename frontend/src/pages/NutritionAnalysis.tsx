import { Box, Container, Grid, Paper, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionAnalysis = () => {
  const macroData = {
    labels: ['Protein', 'Carbohydrates', 'Fat'],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Macronutrient Distribution',
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Nutrition Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Total Calories</Typography>
                  <Typography variant="h4">1,850</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">Remaining</Typography>
                  <Typography variant="h4">650</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Protein</Typography>
                  <Typography variant="h6">75g</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Carbs</Typography>
                  <Typography variant="h6">220g</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle1">Fat</Typography>
                  <Typography variant="h6">65g</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Pie data={macroData} options={options} />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default NutritionAnalysis; 