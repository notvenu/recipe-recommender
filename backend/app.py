from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

# ✅ Fetch detailed recipe info using recipe ID
def get_recipe_details(recipe_id):
    try:
        url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
        params = {"apiKey": SPOONACULAR_API_KEY}
        response = requests.get(url, params=params)
        data = response.json()

        return {
            "title": data.get("title", "Unknown Recipe"),
            "image": data.get("image", ""),
            "ingredients": [ing["name"] for ing in data.get("extendedIngredients", [])] if data.get("extendedIngredients") else [],
            "instructions": data.get("instructions", "Instructions not available"),
            "nutrition": {
                "calories": next((n["amount"] for n in data.get("nutrition", {}).get("nutrients", []) if n["name"] == "Calories"), "N/A"),
                "protein": next((n["amount"] for n in data.get("nutrition", {}).get("nutrients", []) if n["name"] == "Protein"), "N/A"),
                "fat": next((n["amount"] for n in data.get("nutrition", {}).get("nutrients", []) if n["name"] == "Fat"), "N/A"),
                "carbs": next((n["amount"] for n in data.get("nutrition", {}).get("nutrients", []) if n["name"] == "Carbohydrates"), "N/A")
            }
        }
    except Exception as e:
        return {"error": f"Failed to fetch details for Recipe ID {recipe_id}: {str(e)}"}

# ✅ Main function to fetch recipes
def get_recipes(ingredients, cuisine, diet):
    try:
        url = "https://api.spoonacular.com/recipes/complexSearch"
        params = {
            "apiKey": SPOONACULAR_API_KEY,
            "includeIngredients": ingredients,
            "cuisine": cuisine,
            "number": 5  # We get 5 recipes first, then fetch details
        }

        if diet in ["vegetarian", "vegan"]:
            params["diet"] = diet

        response = requests.get(url, params=params)
        data = response.json()

        if "results" not in data:
            return []  # Return an empty array to avoid breaking frontend

        recipes = data["results"]

        # Filter out vegetarian recipes if diet is non-vegetarian
        if diet == "non-vegetarian":
            recipes = [r for r in recipes if not r.get("vegetarian", False)]

        # Fetch full details for each recipe using its ID
        detailed_recipes = [get_recipe_details(r["id"]) for r in recipes]

        return detailed_recipes

    except Exception as e:
        return []  # Return empty list instead of error

@app.route("/recommend", methods=["POST"])
def recommend():
    data = request.json
    ingredients = data.get("ingredients", "")
    cuisine = data.get("cuisine", "")
    diet = data.get("diet", "")

    recipes = get_recipes(ingredients, cuisine, diet)
    return jsonify({"recipes": recipes})

if __name__ == "__main__":
    app.run(debug=True)
