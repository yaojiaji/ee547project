const AWS = require('aws-sdk');
const https = require('https');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const comprehend = new AWS.Comprehend();
const transcribe = new AWS.TranscribeService();

const USDA_API_KEY = process.env.USDA_API_KEY;
const FOOD_CACHE_TABLE = 'FoodCache';
const FOOD_RECORDS_TABLE = 'FoodRecords';

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const userId = body.userId;
        const inputText = body.mealDescription;

        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No input provided.' })
            };
        }

        const comprehendParams = {
            Text: inputText,
            LanguageCode: 'en'
        };

        const comprehendResult = await comprehend.detectEntities(comprehendParams).promise();
        const extractedFoods = comprehendResult.Entities
            .filter(entity => entity.Type === 'OTHER')
            .map(entity => entity.Text);

        if (extractedFoods.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No food items detected.' })
            };
        }

        const foodsInfo = [];
        for (const food of extractedFoods) {
            const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(food)}&api_key=${USDA_API_KEY}`;

            const usdaData = await httpGet(searchUrl);
            if (usdaData.foods && usdaData.foods.length > 0) {
                const topMatch = usdaData.foods[0];
                foodsInfo.push({
                    food: topMatch.description,
                    fdcId: topMatch.fdcId
                });
            }
        }

        const putParams = {
            TableName: FOOD_RECORDS_TABLE,
            Item: {
                userId: userId,
                timestamp: Date.now().toString(),
                mealDescription: inputText,
                foods: foodsInfo
            }
        };
        await dynamodb.put(putParams).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Meal recorded successfully.',
                parsedFoods: foodsInfo
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error.' })
        };
    }
};

function httpGet(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => { body += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (e) => {
            reject(e);
        });
    });
}
