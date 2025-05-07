/*
This javascript file is a optimized food parser that 
uses GPT as LLM to analyze the food quantity and nutrition,
which has higher accuracy than AWS comprehend
*/
const OpenAI = require('openai');
const fs = require('fs')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const client = new OpenAI({
    apiKey: OPENAI_API_KEY
});

exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const inputText = body.mealDescription;
        
        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No input provided.' })
            };
        }
        
        let prompt = fs.readFileSync("prompt.txt", 'utf-8');
        prompt = prompt.replace('"{user_input}"', inputText);
        
        // Using the updated OpenAI API format
        const response = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {"role": "user", "content": prompt}
            ],
            temperature: 0
        });
        
        // Extract the response text from the API response
        const parsedOutput = response.choices[0].message.content;
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Meal recorded successfully.',
                parsedFoods: parsedOutput
            })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error.' })
        };
    }
};