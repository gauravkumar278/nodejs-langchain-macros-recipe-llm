import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const responseSchema = {
    "type": "object",
    "properties": {
        "mealType": {
            "type": "string",
            "description": "The meal type (e.g., Breakfast, Lunch, Dinner)"
        },
        "meals": {
            "type": "array",
            "description": "List of meal combinations for the specified meal type",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "The name or title of the meal"
                    },
                    "ingredients": {
                        "type": "array",
                        "description": "List of ingredients used in the meal",
                        "items": {
                            "type": "object",
                            "properties": {
                                "name": {
                                    "type": "string",
                                    "description": "The name of the ingredient"
                                },
                                "quantity": {
                                    "type": "number",
                                    "description": "The quantity of the ingredient used"
                                },
                                "unit": {
                                    "type": "string",
                                    "description": "The unit of measurement for the ingredient (e.g., 'g', 'kg', 'unit', 'dozen')"
                                },
                                "macros": {
                                    "type": "object",
                                    "description": "Macro breakdown for the ingredient",
                                    "properties": {
                                        "protein": { "type": "number", "description": "Protein content in grams" },
                                        "fat": { "type": "number", "description": "Fat content in grams" },
                                        "carbs": { "type": "number", "description": "Carbohydrate content in grams" }
                                    },
                                    "required": ["protein", "fat", "carbs"]
                                }
                            },
                            "required": ["name", "quantity", "unit", "macros"]
                        }
                    },
                    "macros": {
                        "type": "object",
                        "description": "Total macro breakdown for the meal",
                        "properties": {
                            "protein": { "type": "number", "description": "Total protein content in grams" },
                            "fat": { "type": "number", "description": "Total fat content in grams" },
                            "carbs": { "type": "number", "description": "Total carbohydrate content in grams" }
                        },
                        "required": ["protein", "fat", "carbs"]
                    },
                    "recipe": {
                        "type": "array",
                        "description": "Step-by-step instructions for preparing the meal",
                        "items": {
                            "type": "string",
                            "description": "A single step in the recipe"
                        }
                    },
                    "cookingInstructions": {
                        "type": "array",
                        "description": "General cooking tips or instructions for the meal",
                        "items": {
                            "type": "string",
                            "description": "A single cooking tip or instruction"
                        }
                    }
                },
                "required": ["name", "ingredients", "macros", "recipe", "cookingInstructions"]
            }
        }
    },
    "required": ["mealType", "meals"]
};

const userInput = {
    dietType: "Gluten Free",
    macrosPerMeal: {
        Breakfast: { protein: 30, fat: 20, carbs: 10 }
    },
    availableIngredients: [
        { name: "Chicken Breast", description: "Skinless, boneless chicken breast", nutrition: { proteins: 31, fats: 3.6, carbohydrates: 0 }, price: 5.99, unit: "kg" },
        { name: "Avocado", description: "Fresh ripe avocado", nutrition: { proteins: 2, fats: 15, carbohydrates: 9 }, price: 2.99, unit: "unit" },
        { name: "Eggs", description: "Large organic eggs", nutrition: { proteins: 6, fats: 5, carbohydrates: 0.6 }, price: 3.99, unit: "dozen" },
        { name: "Spinach", description: "Fresh spinach leaves", nutrition: { proteins: 2.9, fats: 0.4, carbohydrates: 3.6 }, price: 1.49, unit: "kg" },
        { name: "Brown Rice", description: "Whole grain brown rice", nutrition: { proteins: 2.6, fats: 0.9, carbohydrates: 23 }, price: 1.89, unit: "kg" },
        { name: "Salmon", description: "Fresh Atlantic salmon fillet", nutrition: { proteins: 25, fats: 14, carbohydrates: 0 }, price: 9.99, unit: "kg" },
    ],
    restrictions: ["Pork", "Beef"],
    festivalCuisine: {
        enabled: true,
        festival: "Christmas",
        preferredCuisines: ["Roasted dishes", "Holiday-themed desserts", "Traditional European meals"],
    },
    mealTypes: ["Breakfast"],
};


function generatePrompt(userInput) {
    const restrictionText = userInput.restrictions.length
        ? `Do not include the following ingredients in any meal: ${userInput.restrictions.join(', ')}.`
        : '';
    const festivalText = userInput.festivalCuisine.enabled
        ? `Since this is for ${userInput.festivalCuisine.festival}, incorporate the following preferred cuisines: ${userInput.festivalCuisine.preferredCuisines.join(', ')}.`
        : '';

    return `
You are a nutrition expert and chef. Generate 5–10 meal combinations for each of the following meal types: ${userInput.mealTypes.join(', ')} based on the details below.

- Diet Type: ${userInput.dietType}

Macros for Each Meal Type:
${userInput.mealTypes.map(
        mealType => `
  - ${mealType}: Protein: ${userInput.macrosPerMeal[mealType].protein}g, Fat: ${userInput.macrosPerMeal[mealType].fat}g, Carbs: ${userInput.macrosPerMeal[mealType].carbs}g`
    ).join('')}

- Available Ingredients:
${userInput.availableIngredients.map(ingredient => `
  - ${ingredient.name}: ${ingredient.description} (Protein: ${ingredient.nutrition.proteins}g, Fat: ${ingredient.nutrition.fats}g, Carbs: ${ingredient.nutrition.carbohydrates}g, Price: $${ingredient.price} per ${ingredient.unit})
`).join('')}

Restrictions:
${restrictionText}

Festival-Specific Cuisines:
${festivalText}

For each meal combination, ensure the following:
1. The combined macros from the selected ingredients closely match the target macros for the meal type.
2. Only use the available ingredients listed above and Quantities for ingredients should match the unit provided in the available ingredients list.
3. Do not include any restricted ingredients.
4. If festival-specific cuisine is enabled, ensure the meal reflects the theme or preferences of the festival.
5. Provide a short description of the meal.
6. Include a list of ingredients, their quantities, and individual macro breakdowns.
7. Calculate the total macros for each meal (Protein, Fat, Carbs) and ensure they closely match the target macros.
8. Provide a recipe as an array of steps, where each step is a string describing a specific instruction for preparing the meal.
9. Include additional cooking instructions as an array, with each string providing specific cooking tips or handling advice.

Ensure variety and alignment with macros across all meal combinations.
`;
}

function enrichMealWithPrices(response, userInput) {
    let subtotal = 0; // For the total of all manually calculated meal prices

    response.meals.forEach(meal => {
        let calculatedTotalPrice = 0;

        // Process each ingredient in the meal
        meal.ingredients.forEach(ingredient => {
            // Find the matching ingredient in availableIngredients
            const matchingIngredient = userInput.availableIngredients.find(
                i => i.name === ingredient.name
            );

            if (matchingIngredient) {
                const ingredientQuantity = ingredient.quantity;
                if (!isNaN(ingredientQuantity)) {
                    const calculatedPrice = calculateIngredientPrice(
                        ingredientQuantity,
                        matchingIngredient.price,
                        matchingIngredient.unit
                    );

                    console.log(":calculatedPrice", calculatedPrice);

                    // Assign calculated price to ingredient
                    //ingredient.price = calculatedPrice.toFixed(2);
                    calculatedTotalPrice += calculatedPrice;
                } else {
                    console.warn(`Invalid quantity format for ingredient: ${ingredient.name}`);
                }
            } else {
                console.warn(`Ingredient not found in availableIngredients: ${ingredient.name}`);
            }
        });

        // Manually calculated price for the meal
        const mealPrice = calculatedTotalPrice.toFixed(2);

        // Assign manual price to a new field
        meal.mealPrice = mealPrice;

        // Add the manual price to the subtotal
        subtotal += parseFloat(mealPrice);
    });

    // Assign the total manual price as the subtotal
    response.subtotal = subtotal.toFixed(2);

    return response;
}

// Helper function to calculate ingredient price
function calculateIngredientPrice(quantity, unitPrice, unit) {
    // Handle unit-based pricing
    if (unit === "unit" || unit === "units") {
        return quantity * unitPrice; // Price per unit
    }

    // Handle dozen-based pricing
    if (unit === "dozen") {
        return (quantity / 12) * unitPrice; // Convert quantity to dozens
    }

    // Handle kilogram-based pricing
    if (unit === "kg") {
        return quantity * unitPrice; // Price per kilogram
    }

    // Handle gram-based pricing
    if (unit === "g") {
        return quantity * unitPrice; // Price per gram
    }

    console.warn(`Unsupported unit for pricing: ${unit}`);
    return 0;
}

// Generate Meal Function
async function generateMeal(userInput) {
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
        console.error("Error generating meal plan:", error);
        throw error;
    }
}

// Example Usage
(async () => {
    try {
        const mealPlan = await generateMeal(userInput);
        console.log("Generated Meal Plan:", JSON.stringify(mealPlan, null, 2));
        const enrichedResponse = enrichMealWithPrices(mealPlan, userInput);
        console.log("Price cal Meal Plan:", JSON.stringify(enrichedResponse, null, 2));
    } catch (error) {
        console.error("Error generating meal plan:", error);
    }
})();