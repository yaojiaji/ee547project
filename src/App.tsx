import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './styles/theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FoodLogging from './pages/FoodLogging';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { NutritionProvider } from './context/NutritionContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NutritionProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="food-logging" element={<FoodLogging />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
        </NutritionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 