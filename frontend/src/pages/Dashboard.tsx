import { Grid, Paper, Typography, Box, CircularProgress, TableContainer, Table, TableBody, TableRow, TableCell } from '@mui/material';
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
  const [dailyCalories, setDailyCalories] = useState(0);
  const [dailyMacros, setDailyMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });

  // 获取当日累计热量和宏量营养素
  const fetchDailyCalories = async () => {
    try {
      const response = await api.getAnalyze(userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayRecords = response.records.filter((record: any) => {
        const recordDate = new Date(parseInt(record.timestamp));
        recordDate.setHours(0, 0, 0, 0);
        return recordDate.getTime() === today.getTime();
      });

      const totalCalories = todayRecords.reduce((sum: number, record: any) => {
        return sum + record.summary.macros.calories;
      }, 0);

      const totalMacros = todayRecords.reduce((acc: any, record: any) => {
        return {
          protein: acc.protein + record.summary.macros.protein_g,
          carbs: acc.carbs + record.summary.macros.carbohydrates_g,
          fat: acc.fat + record.summary.macros.fat_g
        };
      }, { protein: 0, carbs: 0, fat: 0 });

      setDailyCalories(totalCalories);
      setDailyMacros(totalMacros);
    } catch (err) {
      console.error('Failed to fetch daily calories:', err);
    }
  };

  useEffect(() => {
    fetchDailyCalories();
  }, [userId]);

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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={Math.min((dailyCalories / calorieGoal) * 100, 100)}
                      size={80}
                      thickness={4}
                      sx={{
                        color: (theme) => {
                          const percentage = (dailyCalories / calorieGoal) * 100;
                          if (percentage > 100) return theme.palette.error.main;
                          if (percentage > 50) return theme.palette.warning.main;
                          return theme.palette.success.main;
                        },
                      }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" component="div" color="text.secondary">
                        {`${Math.round((dailyCalories / calorieGoal) * 100)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {dailyCalories} / {calorieGoal} kcal
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Protein</TableCell>
                        <TableCell align="right">{Math.round(dailyMacros.protein)}g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Carbs</TableCell>
                        <TableCell align="right">{Math.round(dailyMacros.carbs)}g</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Fat</TableCell>
                        <TableCell align="right">{Math.round(dailyMacros.fat)}g</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
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