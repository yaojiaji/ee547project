import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, CircularProgress, Alert, List, ListItem, ListItemText, Divider, IconButton } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { api } from '../services/api';

interface MealSubmissionProps {
  userId: string;
}

export const MealSubmission: React.FC<MealSubmissionProps> = ({ userId }) => {
  const [mealDescription, setMealDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedFoods, setParsedFoods] = useState<any[]>([]);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [step, setStep] = useState<'input' | 'confirm'>('input');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US'; // Set to English

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setMealDescription(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setError('Speech recognition error, please try again');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      console.warn('Speech recognition not supported');
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
        setIsListening(true);
        setError(null);
      } catch (err) {
        setError('Failed to start speech recognition, please try again');
        setIsListening(false);
      }
    }
  };

  const handleFirstSubmit = async () => {
    if (!mealDescription.trim()) {
      setError('Please enter a meal description');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const submitResponse = await api.submitMeal(userId, mealDescription);
      setParsedFoods(submitResponse.parsedFoods);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const nutritionResponse = await api.getNutrition(userId, parsedFoods);
      setNutritionData(nutritionResponse);
      setMealDescription('');
      setParsedFoods([]);
      setStep('input');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get nutrition information');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMealDescription('');
    setParsedFoods([]);
    setNutritionData(null);
    setStep('input');
    setError(null);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Record Meal
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={mealDescription}
          onChange={(e) => setMealDescription(e.target.value)}
          placeholder="Enter your meal description (e.g., 'I had a bowl of rice and two eggs')"
          variant="outlined"
          margin="normal"
          disabled={step === 'confirm'}
          sx={{
            '& .MuiOutlinedInput-root': {
              paddingRight: '60px' // Add padding to make room for the button
            }
          }}
        />
        <IconButton
          onClick={toggleListening}
          disabled={step === 'confirm'}
          sx={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: isListening ? 'error.main' : 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: isListening ? 'error.dark' : 'primary.dark',
            },
            borderRadius: '8px',
            width: '40px',
            height: '40px',
            marginTop: '8px' // Adjust to align with the text field
          }}
        >
          {isListening ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
      </Box>

      {step === 'input' ? (
        <Button
          variant="contained"
          color="primary"
          onClick={handleFirstSubmit}
          disabled={loading || !mealDescription.trim()}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Confirm Description'}
        </Button>
      ) : (
        <>
          <List sx={{ mt: 2, mb: 2, bgcolor: 'background.paper' }}>
            {parsedFoods.map((food, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={`${food.quantity} ${food.unit || ''} ${food.food}`}
                    secondary={nutritionData?.foodDetails[index]?.labelNutrients ? 
                      `Calories: ${nutritionData.foodDetails[index].labelNutrients.calories} | 
                       Protein: ${nutritionData.foodDetails[index].labelNutrients.protein}g | 
                       Fat: ${nutritionData.foodDetails[index].labelNutrients.fat}g | 
                       Carbs: ${nutritionData.foodDetails[index].labelNutrients.carbohydrates}g` : 
                      'Waiting for nutrition analysis...'}
                  />
                </ListItem>
                {index < parsedFoods.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalSubmit}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Confirm Food'}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Start Over
            </Button>
          </Box>
        </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {nutritionData && step === 'input' && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Nutrition Analysis Results
          </Typography>
          
          <Typography variant="subtitle1" gutterBottom>
            Total Calories: {nutritionData.summary.macros.calories} kcal
          </Typography>
          
          <Typography variant="body1">
            Protein: {nutritionData.summary.macros.protein_g}g
          </Typography>
          <Typography variant="body1">
            Fat: {nutritionData.summary.macros.fat_g}g
          </Typography>
          <Typography variant="body1">
            Carbohydrates: {nutritionData.summary.macros.carbohydrates_g}g
          </Typography>
        </Box>
      )}
    </Box>
  );
}; 