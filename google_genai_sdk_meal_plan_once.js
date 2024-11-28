import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// User Input Example
const userInput = {
    dietType: "Gluten Free",
    macrosPerMeal: {
        Breakfast: { protein: 30, fat: 20, carbs: 10 },
        Lunch: { protein: 50, fat: 30, carbs: 20 },
        Dinner: { protein: 40, fat: 25, carbs: 15 }
    },
    availableIngredients: [
        { name: "Chicken Breast", description: "Skinless, boneless chicken breast", nutrition: { proteins: 31, fats: 3.6, carbohydrates: 0 }, price: 5.99, unit: "kg" },
        { name: "Avocado", description: "Fresh ripe avocado", nutrition: { proteins: 2, fats: 15, carbohydrates: 9 }, price: 2.99, unit: "unit" },
        { name: "Eggs", description: "Large organic eggs", nutrition: { proteins: 6, fats: 5, carbohydrates: 0.6 }, price: 3.99, unit: "dozen" },
        { name: "Spinach", description: "Fresh spinach leaves", nutrition: { proteins: 2.9, fats: 0.4, carbohydrates: 3.6 }, price: 1.49, unit: "kg" },
        { name: "Brown Rice", description: "Whole grain brown rice", nutrition: { proteins: 2.6, fats: 0.9, carbohydrates: 23 }, price: 1.89, unit: "kg" },
        { name: "Salmon", description: "Fresh Atlantic salmon fillet", nutrition: { proteins: 25, fats: 14, carbohydrates: 0 }, price: 9.99, unit: "kg" }
    ],
    noOfWeeks: 1,
    daysPerWeek: 3,
    selectedWeekDays: ["Monday", "Wednesday", "Friday"],
    startDate: "2024-11-25",
    mealTypes: ["Breakfast", "Lunch", "Dinner"], // Specify multiple meal types to generate
    restrictions: ["Pork", "Beef"],
    festivalCuisine: {
        enabled: true,
        festival: "Christmas",
        preferredCuisines: ["Roasted", "Holiday-themed Desserts", "Traditional European"]
    }
};

// Response Schema
const responseSchema = {
    type: "object",
    properties: {
        weeks: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    weekNumber: { type: "number", description: "Week number" },
                    days: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                day: { type: "string", description: "Day of the week" },
                                date: { type: "string", description: "Date of the meal in YYYY-MM-DD format" },
                                meals: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            type: { type: "string", description: "Meal type (e.g., Breakfast, Lunch, Dinner)" },
                                            description: { type: "string", description: "Short description of the meal" },
                                            ingredients: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        name: { type: "string", description: "Ingredient name" },
                                                        quantity: { type: "string", description: "Quantity used in the meal" },
                                                        macros: {
                                                            type: "object",
                                                            properties: {
                                                                protein: { type: "number", description: "Protein content in grams" },
                                                                fat: { type: "number", description: "Fat content in grams" },
                                                                carbs: { type: "number", description: "Carbohydrate content in grams" }
                                                            },
                                                            required: ["protein", "fat", "carbs"]
                                                        },
                                                        price: { type: "number", description: "Price of the ingredient" }
                                                    },
                                                    required: ["name", "quantity", "macros", "price"]
                                                }
                                            },
                                            macros: {
                                                type: "object",
                                                properties: {
                                                    protein: { type: "number", description: "Total protein content in grams" },
                                                    fat: { type: "number", description: "Total fat content in grams" },
                                                    carbs: { type: "number", description: "Total carbohydrate content in grams" }
                                                },
                                                required: ["protein", "fat", "carbs"]
                                            },
                                            totalPrice: { type: "number", description: "Total price of the meal" },
                                            recipe: {
                                                type: "array",
                                                items: { type: "string", description: "Step in the recipe" },
                                                description: "Step-by-step instructions for preparing the meal"
                                            },
                                            cookingInstructions: {
                                                type: "array",
                                                items: { type: "string", description: "Additional cooking tips or instructions" },
                                                description: "General cooking instructions or tips for the meal"
                                            }
                                        },
                                        required: ["type", "description", "ingredients", "macros", "totalPrice", "recipe", "cookingInstructions"]
                                    }
                                }
                            },
                            required: ["day", "date", "meals"]
                        }
                    }
                },
                required: ["weekNumber", "days"]
            }
        }
    },
    required: ["weeks"]
};


// Date Calculation Function
function calculateDate(startDate, weekOffset, day) {
    const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day);
    const start = new Date(startDate);
    const offsetDate = new Date(start.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000);
    offsetDate.setDate(offsetDate.getDate() + ((dayIndex - offsetDate.getDay() + 7) % 7));
    return offsetDate.toISOString().split('T')[0];
}

// Generate Prompt Function
function generatePrompt(userInput) {
    const restrictionText = userInput.restrictions.length
        ? `Do not include the following ingredients in any meal: ${userInput.restrictions.join(', ')}.`
        : '';
    const festivalText = userInput.festivalCuisine.enabled
        ? `Since this is for ${userInput.festivalCuisine.festival}, incorporate the following preferred cuisines: ${userInput.festivalCuisine.preferredCuisines.join(', ')}.`
        : '';

    return `
You are a nutrition expert and chef. Generate a meal plan for the following meals: ${userInput.mealTypes.join(', ')} based on the details below.

- Diet Type: ${userInput.dietType}

Macros Per Meal:
${userInput.mealTypes.map(
        mealType => `
  - ${mealType}: Protein: ${userInput.macrosPerMeal[mealType].protein}g, Fat: ${userInput.macrosPerMeal[mealType].fat}g, Carbs: ${userInput.macrosPerMeal[mealType].carbs}g`
    ).join('')}

- Available Ingredients:
${userInput.availableIngredients.map(ingredient => `
  - ${ingredient.name}: ${ingredient.description} (Protein: ${ingredient.nutrition.proteins}g, Fat: ${ingredient.nutrition.fats}g, Carbs: ${ingredient.nutrition.carbohydrates}g, Price: $${ingredient.price} per ${ingredient.unit})
`).join('')}

- Number of Weeks: ${userInput.noOfWeeks}
- Days Per Week: ${userInput.daysPerWeek}
- Selected Weekdays: ${userInput.selectedWeekDays.join(', ')}
- Start Date: ${userInput.startDate}

Restrictions:
${restrictionText}

Festival-Specific Cuisines:
${festivalText}

While generating the meal plan, ensure the following:
1. Generate a separate plan for each meal type (${userInput.mealTypes.join(', ')}).
2. The combined macros from the selected ingredients closely match the target macros for each meal type.
3. Only use the available ingredients listed above.
4. Do not include any restricted ingredients.
5. If festival-specific cuisine is enabled, ensure the meals reflect the theme or preferences of the festival.
6. Provide a short description of each meal.
7. Include a list of ingredients, their quantities, and individual macro breakdowns.
8. Calculate the total macros for each meal (Protein, Fat, Carbs) and ensure they closely match the target macros.
9. Include the price for each ingredient based on its quantity, and calculate the total price for each meal.
10. Provide a recipe as an array of steps, where each step is a string describing a specific instruction for preparing the meal.
11. Include additional cooking instructions as an array, with each string providing specific cooking tips or handling advice.
12. Assign a date to each meal based on the start date and the specified weekdays.
13. Adhere strictly to the diet type (${userInput.dietType}).

Ensure variety across days and weeks while maintaining macro and price alignment.
`;
}


// Calculate the price of an ingredient based on its quantity and unit price
function calculateIngredientPrice(quantity, pricePerUnit, unit) {
    if (unit === "kg") {
        return (quantity / 1000) * pricePerUnit;
    } else if (unit === "g") {
        return (quantity / 1) * pricePerUnit;
    } else if (unit === "unit" || unit === "dozen") {
        return quantity * pricePerUnit;
    }
    return 0;
}

// Add price calculation to the parsed response
function enrichMealWithPrices(response, userInput) {
    let subtotal = 0;

    response.weeks.forEach(week => {
        week.days.forEach(day => {
            day.meals.forEach(meal => {
                let totalPrice = 0;

                meal.ingredients.forEach(ingredient => {
                    const matchingIngredient = userInput.availableIngredients.find(
                        i => i.name === ingredient.name
                    );
                    if (matchingIngredient) {
                        const price = calculateIngredientPrice(
                            parseFloat(ingredient.quantity),
                            matchingIngredient.price,
                            matchingIngredient.unit
                        );
                        ingredient.price = price;
                        totalPrice += price;
                    }
                });

                meal.totalPrice = totalPrice.toFixed(2);
                subtotal += totalPrice;
            });
        });
    });

    response.subtotal = subtotal.toFixed(2);
    return response;
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

        // Add dates and prices to the parsed response
        parsedResponse.weeks.forEach((week, index) => {
            week.days.forEach(day => {
                day.date = calculateDate(userInput.startDate, index, day.day);
            });
        });

        const enrichedResponse = enrichMealWithPrices(parsedResponse, userInput);
        return enrichedResponse;
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
    } catch (error) {
        console.error("Error generating meal plan:", error);
    }
})();
