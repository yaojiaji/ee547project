# Nutrition Analysis System

A cloud-based system that enables users to record their daily food intake, automatically retrieves nutritional data from public databases, analyzes dietary patterns, and provides personalized insights based on nutritional goals.

## Overview

This project leverages AWS serverless architecture to create a comprehensive nutrition tracking and analysis system that helps users make informed dietary decisions. The system supports both text and voice input for food logging, connects to the USDA FoodData Central API for accurate nutritional information, and provides personalized insights based on user-specific health goals.

## Features

- **Intuitive Food Logging**: Record meals using simple text or voice input
  - Natural language processing for food description parsing
  - Support for voice input via Amazon Transcribe
  - Confirmation table for input verification

- **Accurate Nutritional Analysis**:
  - Integration with USDA FoodData Central API
  - Detailed breakdown of macro and micronutrients
  - Personalized nutritional scoring based on health goals

- **Advanced Visualization**:
  - Interactive charts for nutrient intake trends
  - Food group balance visualization
  - Meal timing impact analysis
  - Goal progress tracking

- **Personalized Insights**:
  - Trend analysis over time
  - Goal-based recommendations
  - What-if scenario modeling

## Data Processing Pipeline

1. **Input Parsing Stage**:
   - Process text/voice input via Amazon Transcribe and Comprehend
   - Extract structured food data (food items, quantities, units)
   - Confirm parsed data with user

2. **Food Matching Stage**:
   - Match structured food items against USDA FoodData Central API
   - Identify most relevant matches using similarity scoring
   - Cache frequent queries in DynamoDB

3. **Nutritional Calculation Stage**:
   - Retrieve detailed nutrient profiles using food IDs
   - Calculate nutritional values based on specified quantities
   - Compile daily totals and compare against goals

4. **Data Enrichment & Storage Stages**:
   - Enhance data with contextual metadata
   - Store in appropriate databases for analysis
   - Prepare visualization-ready data for frontend

## Getting Started

### Prerequisites

- AWS Account with appropriate permissions
- Node.js and npm installed
- AWS CLI configured

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Huangzjun/ee547project.git
   cd nutrition-analysis-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Deploy backend infrastructure
   ```
   npm run deploy:backend
   ```

4. Deploy frontend application
   ```
   npm run deploy:frontend
   ```

5. Configure environment variables
   - Create a `.env` file based on `.env.example`
   - Add your USDA API key and AWS configuration

### Local Development

```
npm run dev
```

## Security & Privacy

- All data is encrypted at rest in DynamoDB and Timestream
- JWT-based authentication for user access
- No personally identifiable information (PII) is collected
- User data is anonymized for trend analysis
- Opt-in analytics and data collection

## Team

- Jiaji Yao - Frontend Development
- Yichen Wang - LLM Development
- Zijun Huang - Backend Development & DevOps & Infrastructure

## License

This project is licensed under the MIT License

## Acknowledgments

- USDA FoodData Central for nutritional data
- AWS for cloud infrastructure
