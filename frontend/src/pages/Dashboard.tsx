import { Grid, Paper, Typography, Box } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNutrition } from '../context/NutritionContext';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { calorieGoal } = useNutrition();

  const nutritionData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories',
        data: [2100, 1950, 2300, 2100, 2200, 1800, 2000],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Daily Goal',
        data: Array(7).fill(calorieGoal),
        borderColor: 'rgb(255, 99, 132)',
        borderDash: [5, 5],
        tension: 0,
        pointRadius: 0,
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
        text: 'Weekly Calorie Intake',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + ' kcal';
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Calories (kcal)'
        }
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Today's Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Calories</Typography>
                <Typography variant="h4">1,850</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Protein</Typography>
                <Typography variant="h4">75g</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Carbs</Typography>
                <Typography variant="h4">220g</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle1">Fat</Typography>
                <Typography variant="h4">65g</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 240,
            }}
          >
            <Line options={options} data={nutritionData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 