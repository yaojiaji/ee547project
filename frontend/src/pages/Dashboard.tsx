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
import { NutritionHistory } from '../components/NutritionHistory';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

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
  const { calorieGoal, userId } = useNutrition();
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        const response = await api.getAnalyze(userId);
        const records = response.records;

        // Get the last 7 days of data
        const last7Days = Array(7).fill(0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        records.forEach((record: any) => {
          const recordDate = new Date(parseInt(record.timestamp));
          recordDate.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.floor((today.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff < 7) {
            last7Days[daysDiff] += record.summary.macros.calories;
          }
        });

        setWeeklyData(last7Days.reverse());
      } catch (error) {
        console.error('Error fetching weekly data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyData();
  }, [userId]);

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  const nutritionData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: 'Calories',
        data: weeklyData,
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
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Loading chart data...</Typography>
              </Box>
            ) : (
              <Line options={options} data={nutritionData} />
            )}
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <NutritionHistory userId={userId} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 