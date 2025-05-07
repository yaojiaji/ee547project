import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useNutrition } from '../context/NutritionContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const Profile = () => {
  const { setCalorieGoal } = useNutrition();
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update
    console.log('Profile updated:', profile);
  };

  const macroData = {
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
  };

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
    },
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{ width: 100, height: 100, mb: 2 }}
              alt={profile.name}
              src="/static/images/avatar/1.jpg"
            />
            <Typography variant="h5">{profile.name}</Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                />
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
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Basal Metabolic Rate (BMR): {bmr} kcal/day
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calculated using the Mifflin-St Jeor Equation
                  </Typography>
                </Paper>
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
                />
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Daily Calorie Goal: {calorieGoal} kcal
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie data={macroData} options={options} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Update Profile
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Profile; 