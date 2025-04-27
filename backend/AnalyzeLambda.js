const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const FOOD_RECORDS_TABLE = 'FoodRecords';

exports.handler = async (event) => {
    try {
        const userId = event.queryStringParameters.userId;

        const params = {
            TableName: FOOD_RECORDS_TABLE,
            KeyConditionExpression: 'userId = :u',
            ExpressionAttributeValues: {
                ':u': userId
            }
        };

        const result = await dynamodb.query(params).promise();
        const records = result.Items || [];

        const foodCounter = {};

        records.forEach(record => {
            if (record.foods) {
                record.foods.forEach(foodItem => {
                    const name = foodItem.food;
                    foodCounter[name] = (foodCounter[name] || 0) + 1;
                });
            }
        });

        const sortedFoods = Object.entries(foodCounter).sort((a, b) => b[1] - a[1]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User food analysis',
                topFoods: sortedFoods
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
