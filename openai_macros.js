import { PromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import 'dotenv/config';

const openAIApiKey = process.env.OPENAI_API_KEY;
// Initialize OpenAI
const openAI = new ChatOpenAI({
    apiKey: openAIApiKey,
    model: "gpt-4o", // Replace with your API key
});

const prompt = PromptTemplate.fromTemplate(
    `
    The user is {age} years old, weighs {weight} kg, and is {height} cm tall. Their activity level is {activityLevel}, and their goal is {goal}. 
    Calculate the macronutrient breakdown (proteins, fats, and carbohydrates) in grams per day based on this information.
    You must always output a JSON object with an "carbohydrates" key, "proteins" key and a "fats" key.
    `
);

// Example user input
const userInput = {
    age: 30,
    weight: 75,
    height: 180,
    activityLevel: "moderately active",
    goal: "muscle gain", // Can be 'weight loss', 'maintenance', or 'muscle gain'
    dietaryPreferences: "None" // Could be 'vegan', 'keto', 'gluten-free', etc.
};

async function analyzeData(userInput) {
    const chain = prompt.pipe(openAI).pipe(new JsonOutputParser());
    const response = await chain.invoke(userInput);
    return response;
}

(async () => {
    const response = await analyzeData(userInput);
    console.log("Response:", response);
})();

