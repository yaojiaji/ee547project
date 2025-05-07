
# EE547: Cloud Computing

## 📤 Submit Meal API

**Endpoint:**

```http
POST https://ms4dunz31k.execute-api.us-west-2.amazonaws.com/stage8/submitMeal
Content-Type: application/json
```

该接口用于接收用户的自然语言膳食描述，通过调用自定义解析服务和 USDA 食物搜索 API，提取食物名称和 fdcId，并将结果保存至 DynamoDB 表 FoodRecords。

### ✅ Request Body

```json
{
  "userId": "user123",
  "mealDescription": "I had 1 cup of rice and 2 eggs"
}
```

### ✅ Successful Response

```json
{
  "message": "Meal recorded successfully.",
  "userId": "user123",
  "parsedFoods": [
    {
      "food": "RICE",
      "fdcId": 356554,
      "quantity": 1,
      "unit": "cup"
    },
    {
      "food": "EGGS",
      "fdcId": 2498468,
      "quantity": 2,
      "unit": null
    }
  ]
}
```

### ❌ Failure Responses

- `{"error": "No input provided."}`
- `{"error": "No food items parsed."}`
- `{"error": "Internal server error."}`

### 字段说明

| 字段名          | 类型     | 是否必填 | 描述                                   |
|----------------|----------|----------|----------------------------------------|
| userId         | string   | ✅        | 用户唯一标识符                         |
| mealDescription| string   | ✅        | 自然语言描述的饮食内容                 |

#### 成功响应字段：

| 字段名       | 类型      | 描述                                         |
|--------------|-----------|----------------------------------------------|
| message      | string    | 操作结果描述                                 |
| parsedFoods  | array     | 成功识别的食物数组，每项为一个食物对象       |
| food         | string    | 食物名称（匹配到的 USDA 描述）              |
| fdcId        | number    | USDA FoodData Central 食物唯一 ID           |
| quantity     | number    | 推测/解析得到的数量（默认 1）                |
| unit         | string \| null | 单位（如 "cup", "slice"），可能为 null |

## 🧪 Nutrition Analysis API

**Endpoint:**

```http
POST https://ms4dunz31k.execute-api.us-west-2.amazonaws.com/stage8/nutrition
Content-Type: application/json
```

用于接收解析后的食物列表，根据 USDA FDC API 获取每种食物的营养信息，计算总营养，并记录到数据库中（NutritionSummary 表）。

### ✅ Request Body

```json
{
  "userId": "user123",
  "parsedFoods": [
    {
      "food": "RICE",
      "fdcId": 356554,
      "quantity": 1,
      "unit": "cup"
    },
    {
      "food": "EGGS",
      "fdcId": 2498468,
      "quantity": 2,
      "unit": null
    }
  ]
}
```

### ✅ Successful Response

```json
{
  "message": "Nutrition breakdown calculated and recorded successfully.",
  "userId": "user123",
  "foodDetails": [
    {
      "food": "RICE",
      "fdcId": 356554,
      "quantity": 1,
      "unit": "cup",
      "labelNutrients": {
        "calories": 200,
        "fat": 1.5,
        "carbohydrates": 44.5,
        "protein": 4.2
      }
    },
    {
      "food": "EGGS",
      "fdcId": 2498468,
      "quantity": 2,
      "unit": null,
      "labelNutrients": {
        "calories": 140,
        "fat": 10.0,
        "carbohydrates": 1.0,
        "protein": 12.0
      }
    }
  ],
  "summary": {
    "macros": {
      "calories": 340,
      "fat_g": 11.5,
      "carbohydrates_g": 45.5,
      "protein_g": 16.2
    },
    "vitamins": {
      "calcium_mg": 82.5,
      "iron_mg": 3.4,
      "potassium_mg": 100
    }
  }
}
```

### ❌ Failure Responses

- `{"error": "Invalid or missing parsedFoods array"}`
- `{"error": "Internal server error"}`

### 字段说明

| 字段名               | 类型    | 描述                                              |
|----------------------|---------|---------------------------------------------------|
| message              | string  | 处理结果说明                                      |
| userId               | string  | 当前请求的用户 ID                                 |
| foodDetails          | array   | 每种食物的详细营养信息（数量已乘以倍数）         |
| labelNutrients       | object  | USDA 返回的标准营养字段，如 calories, fat 等     |
| summary              | object  | 所有食物营养值汇总                                |
| summary.macros       | object  | 热量、脂肪、碳水化合物、蛋白质（单位：g）         |
| summary.vitamins     | object  | 钙、铁、钾等微量元素（单位：mg）                  |

## 📘 Get Analyze API

**Endpoint:**

```http
GET https://ms4dunz31k.execute-api.us-west-2.amazonaws.com/stage1/analyze?userId=user123
```

用于查询指定用户的历史营养分析记录（即 NutritionSummary 表中的数据）。

### 📥 Query Parameters（输入）

| 参数名  | 类型   | 是否必填 | 描述             |
|---------|--------|----------|------------------|
| userId  | string | ✅        | 用户唯一标识     |

### 📤 Response Body（输出）

```json
{
  "message": "Nutrition history retrieved successfully.",
  "records": [
    {
      "userId": "user123",
      "timestamp": "1715075216221",
      "foods": [
        {
          "food": "RICE",
          "fdcId": 356554,
          "quantity": 1,
          "unit": "cup"
        },
        {
          "food": "EGGS",
          "fdcId": 2498468,
          "quantity": 2,
          "unit": null
        }
      ],
      "summary": {
        "macros": {
          "calories": 290,
          "fat_g": 11.5,
          "carbohydrates_g": 33,
          "protein_g": 15
        },
        "vitamins": {
          "calcium_mg": 80,
          "iron_mg": 2.5,
          "potassium_mg": 120
        }
      }
    }
  ]
}
```

### ❌ 错误返回示例

- `{"error": "Missing userId parameter"}`
- `{"error": "Internal server error"}`

### 字段说明

| 字段名                         | 类型     | 描述                             |
|--------------------------------|----------|----------------------------------|
| userId                         | string   | 用户唯一标识                     |
| timestamp                      | string   | 提交记录的时间戳（毫秒）        |
| foods                          | array    | 用户提交的食物数组              |
| summary                        | object   | 系统分析得出的营养总览          |
| summary.macros.calories        | number   | 总热量（千卡）                  |
| summary.macros.fat_g           | number   | 总脂肪（克）                    |
| summary.macros.carbohydrates_g | number   | 总碳水（克）                    |
| summary.macros.protein_g       | number   | 总蛋白质（克）                  |
| summary.vitamins.calcium_mg    | number   | 总钙（毫克）                    |
| summary.vitamins.iron_mg       | number   | 总铁（毫克）                    |
| summary.vitamins.potassium_mg  | number   | 总钾（毫克）                    |
