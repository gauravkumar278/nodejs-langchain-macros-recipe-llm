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

// Define the schema for meal plan output
const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        breakfast: z.array(z.object({
            meal: z.string().describe("Description of the breakfast meal"),
            ingredients: z.array(z.string()).describe("List of ingredients used for breakfast"),
            macros: z.object({
                protein: z.number().describe("Protein content in grams"),
                fat: z.number().describe("Fat content in grams"),
                carbs: z.number().describe("Carbohydrate content in grams"),
            }),
        })).describe("List of breakfast meals"),
        lunch: z.array(z.object({
            meal: z.string().describe("Description of the lunch meal"),
            ingredients: z.array(z.string()).describe("List of ingredients used for lunch"),
            macros: z.object({
                protein: z.number().describe("Protein content in grams"),
                fat: z.number().describe("Fat content in grams"),
                carbs: z.number().describe("Carbohydrate content in grams"),
            }),
        })).describe("List of lunch meals"),
        dinner: z.array(z.object({
            meal: z.string().describe("Description of the dinner meal"),
            ingredients: z.array(z.string()).describe("List of ingredients used for dinner"),
            macros: z.object({
                protein: z.number().describe("Protein content in grams"),
                fat: z.number().describe("Fat content in grams"),
                carbs: z.number().describe("Carbohydrate content in grams"),
            }),
        })).describe("List of dinner meals"),
    })
);

const chain = RunnableSequence.from([
    PromptTemplate.fromTemplate(
        `You are a nutrition expert and meal planner. Create {breakfastMealsCount} breakfast meals, {lunchMealsCount} lunch meals, and {dinnerMealsCount} dinner meals based on the following user preferences and available ingredients:

User Preferences:
{userPreferences}

Available Ingredients:
{availableIngredients}

Create a meal plan for each meal type that adheres to the user's diet type and macro preferences. Use only the available ingredients. Each meal should include a description, list of ingredients used, and the macro breakdown.

{format_instructions}`
    ),
    model,
    parser,
]);

// User preferences and available ingredients
const userPreferences = {
    dietType: "Gulten Free",
    macrosPerMeal: {
        Breakfast: { protein: 30, fat: 20, carbs: 10 },
        Lunch: { protein: 50, fat: 30, carbs: 20 },
        Dinner: { protein: 40, fat: 25, carbs: 15 }
    }
};

const availableIngredients = [
    {
        name: "Chicken Breast",
        description: "Skinless, boneless chicken breast",
        nutrition: { proteins: 31, fats: 3.6, carbohydrates: 0 },
        price: 5.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Avocado",
        description: "Fresh ripe avocado",
        nutrition: { proteins: 2, fats: 15, carbohydrates: 9 },
        price: 2.99,
        unit: "unit",
        stock: "instock",
        status: "active"
    },
    {
        name: "Eggs",
        description: "Large organic eggs",
        nutrition: { proteins: 6, fats: 5, carbohydrates: 0.6 },
        price: 3.99,
        unit: "dozen",
        stock: "instock",
        status: "active"
    },
    {
        name: "Spinach",
        description: "Fresh spinach leaves",
        nutrition: { proteins: 2.9, fats: 0.4, carbohydrates: 3.6 },
        price: 1.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Brown Rice",
        description: "Whole grain brown rice",
        nutrition: { proteins: 2.6, fats: 0.9, carbohydrates: 23 },
        price: 1.89,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Quinoa",
        description: "Nutty-flavored quinoa grains",
        nutrition: { proteins: 4.1, fats: 1.9, carbohydrates: 21.3 },
        price: 3.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Salmon",
        description: "Fresh Atlantic salmon fillet",
        nutrition: { proteins: 25, fats: 14, carbohydrates: 0 },
        price: 9.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Broccoli",
        description: "Fresh broccoli florets",
        nutrition: { proteins: 2.8, fats: 0.4, carbohydrates: 6.6 },
        price: 2.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Olive Oil",
        description: "Extra virgin olive oil",
        nutrition: { proteins: 0, fats: 100, carbohydrates: 0 },
        price: 8.99,
        unit: "litre",
        stock: "instock",
        status: "active"
    },
    {
        name: "Almonds",
        description: "Raw whole almonds",
        nutrition: { proteins: 21, fats: 50, carbohydrates: 22 },
        price: 12.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Greek Yogurt",
        description: "Plain Greek yogurt, high in protein",
        nutrition: { proteins: 10, fats: 4, carbohydrates: 3.6 },
        price: 5.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Sweet Potatoes",
        description: "Organic sweet potatoes",
        nutrition: { proteins: 1.6, fats: 0.1, carbohydrates: 20 },
        price: 2.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Cottage Cheese",
        description: "Low-fat cottage cheese",
        nutrition: { proteins: 11, fats: 4.3, carbohydrates: 3.4 },
        price: 4.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Peanut Butter",
        description: "Creamy peanut butter, no added sugar",
        nutrition: { proteins: 25, fats: 50, carbohydrates: 20 },
        price: 3.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Zucchini",
        description: "Fresh organic zucchini",
        nutrition: { proteins: 1.2, fats: 0.3, carbohydrates: 3.1 },
        price: 2.29,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Lentils",
        description: "Dried green lentils",
        nutrition: { proteins: 25, fats: 0.8, carbohydrates: 60 },
        price: 1.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Tofu",
        description: "Firm tofu, high in protein",
        nutrition: { proteins: 8, fats: 4, carbohydrates: 2 },
        price: 3.99,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Cauliflower",
        description: "Fresh cauliflower florets",
        nutrition: { proteins: 1.9, fats: 0.3, carbohydrates: 4.9 },
        price: 2.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Chickpeas",
        description: "Dried chickpeas, great for salads",
        nutrition: { proteins: 19, fats: 6, carbohydrates: 61 },
        price: 2.29,
        unit: "kg",
        stock: "instock",
        status: "active"
    },
    {
        name: "Bell Peppers",
        description: "Fresh bell peppers, assorted colors",
        nutrition: { proteins: 1, fats: 0.3, carbohydrates: 6 },
        price: 3.49,
        unit: "kg",
        stock: "instock",
        status: "active"
    }
];


// Specify the number of meals to generate for each meal type
const mealGenerationCounts = {
    breakfastMealsCount: 2,  // Number of breakfast meals to generate
    lunchMealsCount: 2,      // Number of lunch meals to generate
    dinnerMealsCount: 2      // Number of dinner meals to generate
};

(async () => {
    try {
        const response = await chain.invoke({
            userPreferences: JSON.stringify(userPreferences, null, 2),
            availableIngredients: JSON.stringify(availableIngredients, null, 2),
            breakfastMealsCount: mealGenerationCounts.breakfastMealsCount,
            lunchMealsCount: mealGenerationCounts.lunchMealsCount,
            dinnerMealsCount: mealGenerationCounts.dinnerMealsCount,
            format_instructions: parser.getFormatInstructions(),
        });

        console.log(JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Error generating meal plan:", error);
    }
})();
