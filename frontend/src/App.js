import React, { useState } from "react";
import { getRecipes, detectCuisine, getNutrition } from "./api";

function App() {
    const [ingredients, setIngredients] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [recipes, setRecipes] = useState([]);
    const [detectedCuisine, setDetectedCuisine] = useState("");
    const [nutrition, setNutrition] = useState(null);

    const handleRecipeSearch = async () => {
        const data = await getRecipes(ingredients, cuisine);
        setRecipes(data.recipes);
    };

    const handleCuisineDetection = async () => {
        const data = await detectCuisine(ingredients);
        setDetectedCuisine(data.cuisine);
    };

    const handleNutritionSearch = async () => {
        // For nutrition, we use the first ingredient as an example. You can extend this.
        const firstIngredient = ingredients.split(",")[0];
        const data = await getNutrition(firstIngredient);
        setNutrition(data.nutrition);
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Recipe Recommender</h1>
            <div>
                <input
                    type="text"
                    placeholder="Enter ingredients (comma-separated)"
                    onChange={(e) => setIngredients(e.target.value)}
                    style={{ width: "300px", marginRight: "10px" }}
                />
                <input
                    type="text"
                    placeholder="Enter cuisine (optional)"
                    onChange={(e) => setCuisine(e.target.value)}
                    style={{ width: "200px", marginRight: "10px" }}
                />
                <button onClick={handleRecipeSearch}>Get Recipes</button>
            </div>
            <div style={{ marginTop: "10px" }}>
                <button onClick={handleCuisineDetection}>Detect Cuisine</button>
                <button onClick={handleNutritionSearch} style={{ marginLeft: "10px" }}>Get Nutrition Info</button>
            </div>

            <h2>Recommended Recipes</h2>
            <ul>
                {recipes.map((recipe, index) => (
                    <li key={index}>
                        <h3>{recipe.title}</h3>
                        {recipe.image && <img src={recipe.image} alt={recipe.title} width="200px" />}
                        <p><strong>Ingredients:</strong> {recipe.ingredients.join(", ")}</p>
                        <p><strong>Instructions:</strong> {recipe.instructions}</p>
                    </li>
                ))}
            </ul>

            <h2>Detected Cuisine: {detectedCuisine}</h2>

            <h2>Nutrition Info</h2>
            {nutrition && (
                <table border="1" cellPadding="5">
                    <thead>
                        <tr>
                            <th>Nutrient</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(nutrition).map(([key, value]) => (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default App;
