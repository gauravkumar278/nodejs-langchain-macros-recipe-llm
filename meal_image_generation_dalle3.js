import { DallEAPIWrapper } from "@langchain/openai";
import 'dotenv/config';

const openAIApiKey = process.env.OPENAI_API_KEY;

const tool = new DallEAPIWrapper({
    n: 1, // Default
    model: "dall-e-3", // Default
    apiKey: openAIApiKey, // Default
    style: "natural"
});

function generateMealPrompt(mealName, ingredients) {
    // Join ingredients list into a readable string
    const ingredientsList = ingredients.join(", ");

    // Create the prompt dynamically
    const prompt = `
        A high-quality, professional food photograph of ${mealName}. 
        The dish includes ingredients like ${ingredientsList}. 
        The meal should look fresh, delicious, and perfectly plated, with a natural and realistic appearance. 
        The photo should be shot using a DSLR camera with a shallow depth of field to focus on the meal, 
        capturing fine details and textures of the ingredients. 
        Use natural lighting to enhance the colors and make the food look appetizing. 
        The background should be simple, like a wooden table or marble surface, slightly blurred to keep the focus on the meal.
      `;

    return prompt;
}

async function generateMealImage(mealName, ingredients) {
    const mealPrompt = generateMealPrompt(mealName, ingredients);
    console.log("Generated DALL·E 3 Prompt:\n", mealPrompt);
    const response = await tool.invoke(mealPrompt);
    return response;
}

(async () => {
    const mealName = "Grilled Chicken Salad";
    const ingredients = ["grilled chicken breast", "lettuce", "cherry tomatoes", "cucumbers", "olive oil", "lemon dressing"];
    const response = await generateMealImage(mealName, ingredients);
    console.log("Response:", response);
})();