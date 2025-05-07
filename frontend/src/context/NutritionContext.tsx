import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NutritionContextType {
  calorieGoal: number;
  setCalorieGoal: (calories: number) => void;
  userId: string;
  setUserId: (id: string) => void;
}

const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [calorieGoal, setCalorieGoal] = useState(2000); // Default value
  const [userId, setUserId] = useState('user123'); // Default user ID

  return (
    <NutritionContext.Provider value={{ calorieGoal, setCalorieGoal, userId, setUserId }}>
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = () => {
  const context = useContext(NutritionContext);
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  return context;
}; 