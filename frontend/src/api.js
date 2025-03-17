import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:5000"; // Change once deployed

export const getRecipes = async (ingredients, cuisine) => {
    const response = await axios.post(`${API_BASE_URL}/recommend`, { ingredients, cuisine });
    return response.data;
};

export const detectCuisine = async (ingredients) => {
    const response = await axios.post(`${API_BASE_URL}/detect-cuisine`, { ingredients });
    return response.data;
};

export const getNutrition = async (food) => {
    const response = await axios.post(`${API_BASE_URL}/nutrition`, { food });
    return response.data;
};
