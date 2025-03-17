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
USDA_API_KEY = os.getenv("USDA_API_KEY")

# ✅ Fetch Recipes from Spoonacular with Instructions
def get_recipes(ingredients, cuisine):
    url = f"https://api.spoonacular.com/recipes/complexSearch?apiKey={SPOONACULAR_API_KEY}"
    params = {
        "includeIngredients": ingredients,
        "cuisine": cuisine,
        "number": 5,
        "addRecipeInformation": True
    }
    response = requests.get(url, params=params)
    recipes = response.json().get("results", [])
    
    detailed_recipes = []
    for recipe in recipes:
        recipe_id = recipe["id"]
        details_url = f"https://api.spoonacular.com/recipes/{recipe_id}/information?apiKey={SPOONACULAR_API_KEY}"
        details_response = requests.get(details_url).json()
        detailed_recipes.append({
            "title": details_response.get("title"),
            "ingredients": [ingredient["name"] for ingredient in details_response.get("extendedIngredients", [])],
            "instructions": details_response.get("instructions", "No instructions provided"),
        })
    return detailed_recipes

# ✅ Fetch Cuisine Type
def detect_cuisine(ingredients):
    url = f"https://api.spoonacular.com/recipes/cuisine?apiKey={SPOONACULAR_API_KEY}"
    response = requests.post(url, json={"ingredientList": ingredients})
    return response.json().get("cuisine", "Unknown")

# ✅ Fetch Nutrition Data
def get_nutrition(food):
    url = f"https://api.nal.usda.gov/fdc/v1/foods/search?query={food}&api_key={USDA_API_KEY}"
    response = requests.get(url)
    if response.status_code == 200 and "foods" in response.json():
        nutrients = response.json()["foods"][0].get("foodNutrients", [])
        formatted_nutrition = {n["nutrientName"]: f"{n['value']} {n['unitName']}" for n in nutrients}
        return formatted_nutrition
    return "No nutrition data found"

# ✅ API Endpoints
@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    recipes = get_recipes(data.get("ingredients", ""), data.get("cuisine", ""))
    return jsonify({"recipes": recipes})

@app.route('/detect-cuisine', methods=['POST'])
def cuisine():
    data = request.json
    cuisine_type = detect_cuisine(data.get("ingredients", ""))
    return jsonify({"cuisine": cuisine_type})

@app.route('/nutrition', methods=['POST'])
def nutrition():
    data = request.json
    nutrition_info = get_nutrition(data.get("food", ""))
    return jsonify({"nutrition": nutrition_info})

# ✅ Run Flask App
if __name__ == '__main__':
    app.run(debug=True)
