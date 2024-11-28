import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Define the response schema
const responseSchema = {
    type: "object",
    properties: {
        total: {
            type: "object",
            properties: {
                calories: { type: "number", description: "Total daily calorie intake" },
                protein: { type: "number", description: "Total daily protein intake in grams" },
                carbs: { type: "number", description: "Total daily carbohydrate intake in grams" },
                fats: { type: "number", description: "Total daily fat intake in grams" },
            },
            required: ["calories", "protein", "carbs", "fats"]
        },
        meals: {
            type: "object",
            properties: {
                breakfast: {
                    type: "object",
                    properties: {
                        calories: { type: "number" },
                        protein: { type: "number" },
                        carbs: { type: "number" },
                        fats: { type: "number" }
                    },
                    required: ["calories", "protein", "carbs", "fats"]
                },
                lunch: {
                    type: "object",
                    properties: {
                        calories: { type: "number" },
                        protein: { type: "number" },
                        carbs: { type: "number" },
                        fats: { type: "number" }
                    },
                    required: ["calories", "protein", "carbs", "fats"]
                },
                dinner: {
                    type: "object",
                    properties: {
                        calories: { type: "number" },
                        protein: { type: "number" },
                        carbs: { type: "number" },
                        fats: { type: "number" }
                    },
                    required: ["calories", "protein", "carbs", "fats"]
                }
            },
            required: ["breakfast", "lunch", "dinner"]
        },
        explanation: { type: "string", description: "Explanation of the macro breakdown and meal split." }
    },
    required: ["total", "meals", "explanation"]
};

// Function to generate the prompt
function generatePrompt(userInput) {
    return `You are a nutrition expert. Analyze the following user information and provide a detailed macro breakdown for daily intake and meal splits:

Age: ${userInput.age}
Weight: ${userInput.weight} kg
Height: ${userInput.height} cm
Activity Level: ${userInput.activityLevel}
Goal: ${userInput.goal}
Dietary Preferences: ${userInput.dietaryPreferences}

Provide total daily macro intake and distribute it across breakfast, lunch, and dinner, specifying recommended percentages and quantities for each meal. **Ensure the sum of calories and macros for all meals equals the total daily amount specified.**`;
}


async function analyzeMacros(userInput) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const prompt = generatePrompt(userInput);
        const result = await model.generateContent(prompt);
        const response = result.response;
        const parsedResponse = JSON.parse(response.text());

        return parsedResponse;
    } catch (error) {
        console.error("Error in macro analysis:", error);
        throw error;
    }
}

// Example usage
const userInput = {
    age: 33,
    weight: 66,
    height: 170,
    activityLevel: "Daily Active",
    goal: "muscle gain",
    dietaryPreferences: "None"
};

// Run the analysis
(async () => {
    try {
        const result = await analyzeMacros(userInput);
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error analyzing macros:", error);
    }
})();
