import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Alert,
  Snackbar,
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNutrition } from '../context/NutritionContext';
import { api } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { setCalorieGoal, userId } = useNutrition();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    age: '28',
    weight: '75',
    height: '180',
    gender: 'male',
    proteinGoal: '150', // grams
    carbsGoal: '200',   // grams
    fatGoal: '65',      // grams
  });

  const [calorieGoal, setLocalCalorieGoal] = useState(0);
  const [bmr, setBMR] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate BMR and calorie goals whenever relevant profile fields change
  useEffect(() => {
    // Calculate BMR using Mifflin-St Jeor Equation
    const weight = Number(profile.weight);
    const height = Number(profile.height);
    const age = Number(profile.age);
    
    let calculatedBMR = 0;
    if (profile.gender === 'male') {
      calculatedBMR = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      calculatedBMR = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    setBMR(Math.round(calculatedBMR));

    // Calculate total calories based on macronutrient goals
    const totalCalories = 
      (Number(profile.proteinGoal) * 4) +
      (Number(profile.carbsGoal) * 4) +
      (Number(profile.fatGoal) * 9);
    setLocalCalorieGoal(totalCalories);
    setCalorieGoal(totalCalories); // Update the shared context
  }, [profile.weight, profile.height, profile.age, profile.gender, profile.proteinGoal, profile.carbsGoal, profile.fatGoal, setCalorieGoal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Calculate total calories before saving
      const totalCalories = 
        (Number(profile.proteinGoal) * 4) +
        (Number(profile.carbsGoal) * 4) +
        (Number(profile.fatGoal) * 9);
      
      // Update the profile
      await api.updateProfile(userId, profile);
      
      // Update the calorie goal in the context
      setCalorieGoal(totalCalories);
      
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
  };

  // Use useMemo to calculate chart data only when macronutrient goals change
  const macroData = useMemo(() => ({
    labels: ['Protein', 'Carbohydrates', 'Fat'],
    datasets: [
      {
        data: [
          Number(profile.proteinGoal) * 4,
          Number(profile.carbsGoal) * 4,
          Number(profile.fatGoal) * 9,
        ],
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
  }), [profile.proteinGoal, profile.carbsGoal, profile.fatGoal]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Calorie Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = Math.round((value / calorieGoal) * 100);
            return `${label}: ${value} kcal (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 2, mt: 2, mb: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Basal Metabolic Rate (BMR)</TableCell>
                          <TableCell align="right">{bmr} kcal/day</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            Calculated using the Mifflin-St Jeor Equation
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Daily Calorie Goal</TableCell>
                          <TableCell align="right">{calorieGoal} kcal/day</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            Based on your macronutrient goals
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={profile.age}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Weight (kg)"
                  name="weight"
                  type="number"
                  value={profile.weight}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={profile.height}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={profile.gender}
                    label="Gender"
                    onChange={handleSelectChange}
                    disabled={loading}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Daily Macronutrient Goals
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Protein (g)"
                  name="proteinGoal"
                  type="number"
                  value={profile.proteinGoal}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Carbohydrates (g)"
                  name="carbsGoal"
                  type="number"
                  value={profile.carbsGoal}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Fat (g)"
                  name="fatGoal"
                  type="number"
                  value={profile.fatGoal}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 4 }}>
            <Pie data={macroData} options={options} />
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message="Profile updated successfully"
      />
    </Container>
  );
};

export default Profile; 