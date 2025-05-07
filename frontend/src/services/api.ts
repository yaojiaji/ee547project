import axios from 'axios';

const API_BASE_URL = 'https://ms4dunz31k.execute-api.us-west-2.amazonaws.com';

interface ParsedFood {
  food: string;
  fdcId: number;
  quantity: number;
  unit: string | null;
}

interface NutritionSummary {
  macros: {
    calories: number;
    fat_g: number;
    carbohydrates_g: number;
    protein_g: number;
  };
  vitamins: {
    calcium_mg: number;
    iron_mg: number;
    potassium_mg: number;
  };
}

interface SubmitMealResponse {
  message: string;
  userId: string;
  parsedFoods: ParsedFood[];
}

interface NutritionResponse {
  message: string;
  userId: string;
  foodDetails: Array<ParsedFood & {
    labelNutrients: {
      calories: number;
      fat: number;
      carbohydrates: number;
      protein: number;
    };
  }>;
  summary: NutritionSummary;
}

interface AnalyzeResponse {
  message: string;
  records: Array<{
    userId: string;
    timestamp: string;
    foods: ParsedFood[];
    summary: NutritionSummary;
  }>;
}

interface Profile {
  name: string;
  age: string;
  weight: string;
  height: string;
  gender: string;
  proteinGoal: string;
  carbsGoal: string;
  fatGoal: string;
}

interface UpdateProfileResponse {
  message: string;
  userId: string;
  profile: Profile;
}

export const api = {
  // 提交膳食描述
  submitMeal: async (userId: string, mealDescription: string): Promise<SubmitMealResponse> => {
    const response = await axios.post(`${API_BASE_URL}/stage8/submitMeal`, {
      userId,
      mealDescription,
    });
    return response.data;
  },

  // 获取营养分析
  getNutrition: async (userId: string, parsedFoods: ParsedFood[]): Promise<NutritionResponse> => {
    const response = await axios.post(`${API_BASE_URL}/stage8/nutrition`, {
      userId,
      parsedFoods,
    });
    return response.data;
  },

  // 获取历史分析记录
  getAnalyze: async (userId: string): Promise<AnalyzeResponse> => {
    const response = await axios.get(`${API_BASE_URL}/stage1/analyze`, {
      params: { userId },
    });
    return response.data;
  },

  // 更新个人资料
  updateProfile: async (userId: string, profile: Profile): Promise<UpdateProfileResponse> => {
    const response = await axios.put(`${API_BASE_URL}/stage8/profile`, {
      userId,
      profile,
    });
    return response.data;
  },
}; 