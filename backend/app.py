from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# API Keys
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

# ✅ Fetch Recipes from Spoonacular
def get_recipes(ingredients, cuisine):
    try:
        url = f"https://api.spoonacular.com/recipes/complexSearch?apiKey={SPOONACULAR_API_KEY}"
        params = {
            "includeIngredients": ingredients,
            "cuisine": cuisine,
            "number": 5
        }
        response = requests.get(url, params=params)
        recipes = response.json().get("results", [])

        recipe_details = []
        for recipe in recipes:
            details = get_recipe_details(recipe["id"])
            if "error" not in details:
                recipe_details.append(details)

        return recipe_details
    except Exception as e:
        return {"error": str(e)}

# ✅ Fetch Detailed Recipe Information
def get_recipe_details(recipe_id):
    try:
        url = f"https://api.spoonacular.com/recipes/{recipe_id}/information?apiKey={SPOONACULAR_API_KEY}"
        details = requests.get(url).json()

        # Fetch Nutrition Data
        nutrition_url = f"https://api.spoonacular.com/recipes/{recipe_id}/nutritionWidget.json?apiKey={SPOONACULAR_API_KEY}"
        nutrition_data = requests.get(nutrition_url).json()

        # Extract relevant nutrition info
        nutrition_info = {
            "calories": next((item["amount"] for item in nutrition_data.get("bad", []) if item["title"] == "Calories"), "N/A"),
            "protein": next((item["amount"] for item in nutrition_data.get("good", []) if item["title"] == "Protein"), "N/A"),
            "fat": next((item["amount"] for item in nutrition_data.get("bad", []) if item["title"] == "Fat"), "N/A"),
            "carbs": next((item["amount"] for item in nutrition_data.get("bad", []) if item["title"] == "Carbohydrates"), "N/A")
        }

        return {
            "id": recipe_id,
            "title": details.get("title"),
            "image": details.get("image", ""),
            "ingredients": [ingredient["original"] for ingredient in details.get("extendedIngredients", [])],
            "instructions": details.get("instructions", "No instructions provided"),
            "cuisine": details.get("cuisines", ["Unknown"])[0],
            "nutrition": nutrition_info
        }
    except Exception as e:
        return {"error": str(e)}

# ✅ API Endpoints
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    recipes = get_recipes(data.get("ingredients", ""), data.get("cuisine", ""))
    return jsonify({"recipes": recipes})

@app.route('/recipe-details/<int:recipe_id>', methods=['GET'])
def recipe_details(recipe_id):
    details = get_recipe_details(recipe_id)
    return jsonify(details)

# ✅ Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
