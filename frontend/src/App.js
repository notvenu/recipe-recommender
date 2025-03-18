import React, { useState } from "react";
import "./RecipeRecommender.css"; // Importing the CSS file

const RecipeRecommender = () => {
    const [ingredients, setIngredients] = useState("");
    const [cuisine, setCuisine] = useState("");
    const [diet, setDiet] = useState("");  
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    const handleSearch = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ingredients, cuisine, diet }),
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
        <div className={`container ${darkMode ? "dark" : "light"}`}>
            {/* Dark Mode Toggle Button */}
            <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
            </button>

            <h1 className="title">Recipe Recommender</h1>

            <div className="input-section">
                <input
                    type="text"
                    placeholder="Enter ingredients (comma-separated)..."
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="input-box"
                />

                <input
                    type="text"
                    placeholder="Enter cuisine (optional)..."
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="input-box"
                />

                <select value={diet} onChange={(e) => setDiet(e.target.value)} className="dropdown">
                    <option value="">Any</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                </select>

                <button onClick={handleSearch} className="search-button">Search</button>
            </div>

            <ul className="recipe-list">
                {recipes.map((recipe, index) => (
                    <li key={index} className="recipe-card">
                        <h3 className="recipe-title">{recipe.title}</h3>

                        {recipe.image && <img src={recipe.image} alt={recipe.title} className="recipe-image" />}

                        {/* Button is below the image */}
                        <button onClick={() => handleRecipeDetails(recipe)} className="details-button">
                            {selectedRecipe === recipe ? "Hide Details" : "Show Details"}
                        </button>

                        {selectedRecipe === recipe && (
                            <div className="details-section">
                                <h4>Ingredients:</h4>
                                <ul className="details-list">
                                    {recipe.ingredients?.length > 0
                                        ? recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
                                        : <li>Not Available</li>}
                                </ul>

                                <h4>Instructions:</h4>
                                <ol className="details-list">
                                    {recipe.instructions?.trim()
                                        ? recipe.instructions.split(". ").map((step, i) => <li key={i}>{step}</li>)
                                        : <li>Not Available</li>}
                                </ol>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecipeRecommender;
