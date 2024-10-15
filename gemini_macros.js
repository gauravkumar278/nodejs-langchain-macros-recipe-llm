import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import 'dotenv/config';

const geminiAIApiKey = process.env.GOOGLE_API_KEY;

const model = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    maxOutputTokens: 2048,
    apiKey: geminiAIApiKey,
});

// Define the schema for macro analysis output
const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        calories: z.number().describe("The recommended daily calorie intake"),
        protein: z.number().describe("The recommended daily protein intake in grams"),
        carbs: z.number().describe("The recommended daily carbohydrate intake in grams"),
        fats: z.number().describe("The recommended daily fat intake in grams"),
        explanation: z.string().describe("A brief explanation of the macro breakdown and any additional dietary advice"),
    })
);

const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `You are a nutrition expert. Analyze the following user information and provide a macro breakdown:

Age: {age}
Weight: {weight} kg
Height: {height} cm
Activity Level: {activityLevel}
Goal: {goal}
Dietary Preferences: {dietaryPreferences}

Provide a structured output with the recommended daily intake for calories, protein, carbs, and fats, along with a brief explanation.
Ensure that the macronutrient breakdown is appropriate for the user's goals and dietary preferences.

{format_instructions}`
    ),
    model,
    parser,
]);

// Example user input
const userInput = {
    age: 32,
    weight: 64,
    height: 175,
    activityLevel: "Daily Active",
    goal: "muscle gain",
    dietaryPreferences: "None"
};

(async () => {
    try {
        const response = await chain.invoke({
            ...userInput,
            format_instructions: parser.getFormatInstructions(),
        });

        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error analyzing macros:", error);
    }
})();