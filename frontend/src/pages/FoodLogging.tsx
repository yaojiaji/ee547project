import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Fab,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

const FoodLogging: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodDescription, setFoodDescription] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setFoodDescription(transcript);
        setIsListening(false);
        // TODO: Call backend API to process the food description
        processFoodDescription(transcript);
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const processFoodDescription = async (description: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/process-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });
      const data = await response.json();
      setFoodItems([...foodItems, data]);
    } catch (error) {
      console.error('Error processing food description:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (foodDescription.trim()) {
      processFoodDescription(foodDescription);
      setFoodDescription('');
    }
  };

  const handleDelete = (index: number) => {
    const newFoodItems = foodItems.filter((_, i) => i !== index);
    setFoodItems(newFoodItems);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newFoodItems = [...foodItems];
    newFoodItems[index] = { ...newFoodItems[index], quantity: newQuantity };
    setFoodItems(newFoodItems);
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Food Logging
      </Typography>
      
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="What did you eat?"
            placeholder="Enter your food description (e.g., 'I had 2 slices of whole wheat bread with peanut butter')"
            value={foodDescription}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFoodDescription(e.target.value)}
          />
          <Fab
            color={isListening ? 'secondary' : 'primary'}
            size="small"
            onClick={toggleListening}
            sx={{ minWidth: 40 }}
          >
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </Fab>
        </Box>
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
        >
          Add Food Item
        </Button>
      </Paper>

      <List>
        {foodItems.map((item, index) => (
          <ListItem
            key={index}
            sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              mb: 1,
              backgroundColor: '#f5f5f5'
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Typography variant="subtitle1">{item.name}</Typography>
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  type="number"
                  size="small"
                  value={item.quantity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuantityChange(index, Number(e.target.value))}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </Grid>
              <Grid item xs={4} sm={2}>
                <Typography>{item.unit}</Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                {item.calories && (
                  <Typography variant="body2" color="text.secondary">
                    Calories: {item.calories} | Protein: {item.protein}g | Carbs: {item.carbs}g | Fat: {item.fat}g
                  </Typography>
                )}
              </Grid>
              <Grid item xs={2} sm={1}>
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FoodLogging; 