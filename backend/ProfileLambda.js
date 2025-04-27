const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const USER_PROFILES_TABLE = 'UserProfiles';

exports.handler = async (event) => {
    try {
        const method = event.httpMethod;

        if (method === 'GET') {
            const userId = event.queryStringParameters.userId;

            const params = {
                TableName: USER_PROFILES_TABLE,
                Key: { userId }
            };

            const data = await dynamodb.get(params).promise();
            if (data.Item) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(data.Item)
                };
            } else {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'User not found' })
                };
            }

        } else if (method === 'PUT') {
            const body = JSON.parse(event.body);
            const params = {
                TableName: USER_PROFILES_TABLE,
                Item: {
                    userId: body.userId,
                    calorieTarget: body.calorieTarget,
                    dietaryPreferences: body.dietaryPreferences || []
                }
            };

            await dynamodb.put(params).promise();

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Profile updated successfully' })
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Unsupported HTTP method' })
            };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
