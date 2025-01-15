// Constants for Macronutrient Ratios
const MACRONUTRIENT_RATIOS = {
    carbs: 0.40,   // 40% of calories from carbohydrates
    protein: 0.30, // 30% of calories from protein
    fats: 0.30     // 30% of calories from fats
};

const ACTIVITY_MULTIPLIERS = {
    "Sedentary": 1.2,
    "Lightly Active": 1.375,
    "Moderately Active": 1.55,
    "Very Active": 1.725,
    "Extra Active": 1.9
};

const NUTRITION_CONSTANTS = {
    PROTEIN_CALORIES_PER_GRAM: 4,
    CARB_CALORIES_PER_GRAM: 4,
    FAT_CALORIES_PER_GRAM: 9
};

// Parse height for imperial and metric formats
const parseHeight = (height, unit) => {
    if (unit === "imperial") {
        const matches = height.match(/(\d+)\s*feet\s*(\d+)\s*inches/i);
        if (matches) {
            const feet = parseInt(matches[1], 10);
            const inches = parseInt(matches[2], 10);
            return (feet * 12 + inches) * 2.54; // Convert to centimeters
        } else {
            throw new Error("Invalid height format for imperial units. Expected 'X feet Y inches'.");
        }
    }
    return parseFloat(height); // Metric height is already in cm
};

// Parse weight for imperial and metric formats
const parseWeight = (weight, unit) => {
    if (unit === "imperial") {
        const matches = weight.match(/(\d+)\s*lbs/i);
        if (matches) {
            return parseFloat(matches[1]) * 0.453592; // Convert pounds to kilograms
        } else {
            throw new Error("Invalid weight format for imperial units. Expected 'X lbs'.");
        }
    }
    return parseFloat(weight); // Metric weight is already in kg
};

// Core calculation functions
const calculateBMR = (weight, height, age, gender) => {
    const baseBMR = (10 * weight) + (6.25 * height) - (5 * age);
    return gender.toLowerCase() === 'female' ? baseBMR - 161 : baseBMR + 5;
};

const calculateTDEE = (bmr, activity) => {
    return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity]);
};

const calculateMacrosInGrams = (targetCalories) => {
    const { carbs, protein, fats } = MACRONUTRIENT_RATIOS;

    return {
        protein: Math.round((targetCalories * protein) / NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM),
        carbs: Math.round((targetCalories * carbs) / NUTRITION_CONSTANTS.CARB_CALORIES_PER_GRAM),
        fats: Math.round((targetCalories * fats) / NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM)
    };
};

// Adjust calories for 0.5 kg/week weight change
const adjustCaloriesForObjective = (tdee, objective) => {
    const calorieAdjustment = 550; // Calorie adjustment for 0.5 kg/week
    if (objective.toLowerCase() === "weight gain") {
        return tdee + calorieAdjustment; // Add calories for weight gain
    } else if (objective.toLowerCase() === "weight loss") {
        return tdee - calorieAdjustment; // Subtract calories for weight loss
    } else {
        return tdee; // Maintain current weight
    }
};

const generateExplanation = (gender, activity, goal, targetCalories) => {
    const calorieDistribution = {
        breakfast: Math.round(targetCalories * 0.35), // 35% of daily calories
        lunch: Math.round(targetCalories * 0.35),    // 35% of daily calories
        dinner: Math.round(targetCalories * 0.30)    // 30% of daily calories
    };

    return `This macro breakdown is designed for a ${gender} with a ${activity.toLowerCase()} activity level and a ${goal.toLowerCase()} objective. The total daily calorie intake is set at ${targetCalories} calories, with a focus on consuming sufficient protein to support muscle mass during ${goal.toLowerCase()}. The meals are distributed as follows:
- **Breakfast**: ${calorieDistribution.breakfast} calories
- **Lunch**: ${calorieDistribution.lunch} calories
- **Dinner**: ${calorieDistribution.dinner} calories.`;
};

const calculateMacroBreakdown = (targetCalories, gender, activity, goal) => {
    const macrosInGrams = calculateMacrosInGrams(targetCalories);
    const calorieDistribution = {
        breakfast: Math.round(targetCalories * 0.35), // 35% of daily calories
        lunch: Math.round(targetCalories * 0.35),    // 35% of daily calories
        dinner: Math.round(targetCalories * 0.30)    // 30% of daily calories
    };

    return {
        totalMacros: {
            calories: targetCalories,
            protein: macrosInGrams.protein,
            carbs: macrosInGrams.carbs,
            fats: macrosInGrams.fats
        },
        macrosBreakdown: [
            {
                mealType: "Breakfast",
                calories: calorieDistribution.breakfast,
                protein: Math.round((calorieDistribution.breakfast * MACRONUTRIENT_RATIOS.protein) / NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM),
                carbs: Math.round((calorieDistribution.breakfast * MACRONUTRIENT_RATIOS.carbs) / NUTRITION_CONSTANTS.CARB_CALORIES_PER_GRAM),
                fats: Math.round((calorieDistribution.breakfast * MACRONUTRIENT_RATIOS.fats) / NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM)
            },
            {
                mealType: "Lunch",
                calories: calorieDistribution.lunch,
                protein: Math.round((calorieDistribution.lunch * MACRONUTRIENT_RATIOS.protein) / NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM),
                carbs: Math.round((calorieDistribution.lunch * MACRONUTRIENT_RATIOS.carbs) / NUTRITION_CONSTANTS.CARB_CALORIES_PER_GRAM),
                fats: Math.round((calorieDistribution.lunch * MACRONUTRIENT_RATIOS.fats) / NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM)
            },
            {
                mealType: "Dinner",
                calories: calorieDistribution.dinner,
                protein: Math.round((calorieDistribution.dinner * MACRONUTRIENT_RATIOS.protein) / NUTRITION_CONSTANTS.PROTEIN_CALORIES_PER_GRAM),
                carbs: Math.round((calorieDistribution.dinner * MACRONUTRIENT_RATIOS.carbs) / NUTRITION_CONSTANTS.CARB_CALORIES_PER_GRAM),
                fats: Math.round((calorieDistribution.dinner * MACRONUTRIENT_RATIOS.fats) / NUTRITION_CONSTANTS.FAT_CALORIES_PER_GRAM)
            }
        ],
        explanation: generateExplanation(gender, activity, goal, targetCalories)
    };
};


// Example usage
const calculateNutritionPlan = (userProfile) => {
    try {
        const unit = userProfile.unit === "imperial" ? "imperial" : "metric";
        const weight = parseWeight(userProfile.weight, unit);
        const height = parseHeight(userProfile.height, unit);
        // Validate input
        //const validatedProfile = userProfileSchema.parse(userProfile);

        // Calculate metrics
        const bmr = Math.round(calculateBMR(
            weight,
            height,
            userProfile.age,
            userProfile.gender
        ));

        const tdee = calculateTDEE(bmr, userProfile.activity);
        console.log("tdee", tdee);
        // Adjust calories for weight gain or loss
        const targetCalories = adjustCaloriesForObjective(tdee, userProfile.objective);
        console.log("targetCalories", targetCalories);

        const macroBreakdown = calculateMacroBreakdown(targetCalories, userProfile.gender, userProfile.activity, userProfile.objective);

        return {
            ...macroBreakdown,
            calculations: {
                bmr,
                tdee
            }
        };
    } catch (error) {
        throw new Error(`Error calculating nutrition plan: ${error.message}`);
    }
};

// Example profile
// const exampleProfile = {
//     age: 25,
//     weight: 85, // kg
//     height: 181, // cm
//     gender: 'male',
//     activity: "Very Active",
//     dietaryPreferences: "None",
//     healthConditions: "None"
// };

// Example profiles
const exampleImperialProfile = {
    gender: "female",
    age: 25,
    height: "170",
    weight: "60 kg",
    unit: "metric",
    activity: "Sedentary",
    objective: "Weight Gain"
};

const exampleMetricProfile = {
    gender: "female",
    age: 18,
    height: "170",
    weight: "60 kg",
    unit: "metric",
    activity: "Sedentary",
    objective: "Weight Loss"
};

// Calculate and display results
console.log("Weight Gain Result:", JSON.stringify(calculateNutritionPlan(exampleImperialProfile), null, 2));
console.log("Weight Loss Result:", JSON.stringify(calculateNutritionPlan(exampleMetricProfile), null, 2));

