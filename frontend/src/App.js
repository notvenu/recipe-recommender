import React, { useState } from "react";

const RecipeRecommender = () => {
    const [ingredients, setIngredients] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const handleSearch = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ingredients, cuisine }),
            });

            const data = await response.json();
            setRecipes(data.recipes || []);
        } catch (error) {
            console.error("Error fetching recipes:", error);
        }
    };

    const handleRecipeDetails = (recipe) => {
        setSelectedRecipe(selectedRecipe === recipe ? null : recipe);
    };

    return (
        <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif" }}>
            <h1>Recipe Recommender</h1>

            {/* Input for Ingredients */}
            <input
                type="text"
                placeholder="Enter ingredients (comma-separated)..."
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                style={{ padding: "10px", width: "250px", marginRight: "10px" }}
            />

            {/* Input for Cuisine Type */}
            <input
                type="text"
                placeholder="Enter cuisine (optional)..."
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                style={{ padding: "10px", width: "250px", marginRight: "10px" }}
            />

            {/* Search Button */}
            <button onClick={handleSearch} style={{ padding: "10px 20px", cursor: "pointer" }}>
                Search
            </button>

            {/* Recipe List */}
            <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
                {recipes.map((recipe, index) => (
                    <li key={index} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}>
                        <h3>{recipe.title}</h3>
                        {recipe.image && <img src={recipe.image} alt={recipe.title} width="200px" style={{ borderRadius: "8px" }} />}
                        <br />
                        <button onClick={() => handleRecipeDetails(recipe)} style={{ marginTop: "10px", padding: "8px 15px", cursor: "pointer" }}>
                            {selectedRecipe === recipe ? "Hide Details" : "Show Details"}
                        </button>

                        {selectedRecipe === recipe && (
                            <>
                                <p><strong>Ingredients:</strong> {recipe.ingredients?.length > 0 ? recipe.ingredients.join(", ") : "Not Available"}</p>
                                <p><strong>Instructions:</strong> {recipe.instructions?.trim() ? recipe.instructions : "Not Available"}</p>
                                {recipe.nutrition && (
                                    <p>
                                        <strong>Nutrition:</strong> {recipe.nutrition.calories} kcal, 
                                        {recipe.nutrition.protein}g Protein, 
                                        {recipe.nutrition.fat}g Fat, 
                                        {recipe.nutrition.carbs}g Carbs
                                    </p>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecipeRecommender;
