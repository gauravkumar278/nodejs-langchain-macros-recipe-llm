# nodejs-langchain-macros-recipe-llm
Node.js Langchain Macros &amp; Recipe Generation (LLM)

Welcome to the Node.js Langchain Macros & Recipe Generation repository. This project integrates AI-driven functionalities using Langchain, Gemini AI, and OpenAI for generating meal plans based on user preferences, including diet types, macro targets, and available ingredients. It can optimize meal generation for different times of day and provides a macro-nutrient breakdown.


# Overview
This project allows users to:

Generate meal plans using AI (Langchain, Gemini AI, OpenAI) based on macros like proteins, fats, and carbohydrates.

Choose from different diet types such as Keto, Vegan, etc.

Use only available ingredients to ensure optimized meal planning.

Generate realistic meal images using OpenAI’s DALL·E 3 when meal images are not available in the database.

# Features
AI Meal Generation: Generate breakfast, lunch, and dinner meals based on user preferences and available ingredients.

Macros Calculation: Calculates and provides macro breakdown (protein, fat, carbs) for each meal.

Diet Types: Supports custom diet types like Keto, Vegan, etc.

Photorealistic Meal Images: Generate realistic meal images using OpenAI’s DALL·E 3 when meal images are not available in the database.

Dynamic Ingredients: Integrate available ingredients from the database, making each meal practical to prepare.

# Technologies
Node.js: Backend development environment.

Langchain.js: For chaining prompts and managing AI responses.

Gemini AI / OpenAI: AI models to generate meal plans.

MongoDB: Database for storing available ingredients and recipes.

DALL·E 3 API: For generating natural, DSLR-like food images.

# Environment Variables
Ensure you have the following environment variables set in your .env file:

GOOGLE_API_KEY: API key for Gemini AI from Google.

OPENAI_API_KEY: API key for Open AI.

MONGO_URI: Your MongoDB connection string.