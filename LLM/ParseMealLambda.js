/*
This javascript file is a optimized food parser that 
uses GPT as LLM to analyze the food quantity and nutrition,
which has higher accuracy than AWS comprehend
*/
import OpenAI from "openai";
const fs = require('fs')
const client = new OpenAI();


exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const inputText = body.mealDescription;
        let prompt = fs.readFileSync("prompt.txt", 'utf-8');
        prompt = prompt.replace('"{user_input}"', inputText)
        if (!inputText) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No input provided.' })
            };
        }
        

        const response = await client.responses.create({
            model: "gpt-3.5-turbo",
            input: [
                {"role": "user", "content": prompt}
            ],
            temperature:0
        });
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Meal recorded successfully.',
                parsedFoods: response.output_text
            })
        }
    }
    catch {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error.' })
        };
    }
}

