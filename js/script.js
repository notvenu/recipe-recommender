// Initialize variables
let recipes = [];
let popularRecipes = [];
let isShowingFavorites = false;
let currentUser = null;

function setLoading(isLoading) {
    const container = document.getElementById('recipesContainer');
    if (isLoading) {
        container.innerHTML = '<div class="loading">Loading recipes...</div>';
    }
}

setLoading(true);

function populateFilters() {
    const cuisineSelect = document.getElementById('cuisine');
    const courseSelect = document.getElementById('mealType');
    const dietSelect = document.getElementById('diet');

    const cuisines = [...new Set(recipes.map(r => r.cuisine_type))]
        .filter(Boolean)
        .sort();
    const courseTypes = [...new Set(recipes.map(r => r.course))]
        .filter(Boolean)
        .sort();
    const dietTypes = [...new Set(recipes.map(r => r.diet))]
        .filter(Boolean)
        .sort();

    cuisineSelect.innerHTML = `
        <option value="">All Cuisines</option>
        ${cuisines.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('')}
    `;
    
    courseSelect.innerHTML = `
        <option value="">All Courses</option>
        ${courseTypes.map(c => `<option value="${c.toLowerCase()}">${c}</option>`).join('')}
    `;

    dietSelect.innerHTML = `
        <option value="">All Diets</option>
        ${dietTypes.map(d => `<option value="${d.toLowerCase()}">${d}</option>`).join('')}
    `;
}

// Update your fetch call to handle errors better
// Update the fetch error handling
fetch('/recipes.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load recipes');
        }
        return response.json();
    })
    .then(data => {
        if (!Array.isArray(data)) {
            throw new Error('Invalid data format');
        }
        recipes = data.map(recipe => ({
            id: recipe.id,
            name: recipe.name || '',
            ingredients: (recipe.ingredients || '').split(',').map(i => i.trim()),
            instructions: recipe.instructions || '',
            cuisine_type: recipe.cuisine || 'Other',
            course: recipe.course || 'Main Course',
            diet: recipe.diet || '',
            prep_time: recipe.prep_time || '0',
            description: recipe.description || 'No description available',
            image_name: recipe.image_name || 'default.jpg',
            image_url: recipe.image_url || './archive/data/default.jpg',
            popularity: recipe.popularity || 0  // Add popularity field
        }));

        // Sort recipes by popularity and get top 15
        // Update the popularRecipes slice
        popularRecipes = [...recipes]
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 12);  // Changed from 15 to 12

        setLoading(false);
        populateFilters();
        displayRecipes(popularRecipes); // Display popular recipes first
    })
    .catch(error => {
        console.error('Error loading recipes:', error);
        setLoading(false);
        const container = document.getElementById('recipesContainer');
        if (container) {
            container.innerHTML = `
                <div class="error" style="text-align: center; padding: 2rem;">
                    <h3>Error loading recipes. Please try again later.</h3>
                    <p>Details: ${error.message}</p>
                </div>`;
        }
    });

// Keep only one favorites button click handler
document.getElementById('favoritesBtn').addEventListener('click', () => {
    if (!isUserLoggedIn()) {
        showToast('Please login to view favorites!');
        return;
    }

    const userEmail = localStorage.getItem('email');
    const userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
    const favoritedRecipes = recipes.filter(recipe => userFavorites.includes(recipe.id));
    
    isShowingFavorites = !isShowingFavorites;
    const favoritesBtn = document.getElementById('favoritesBtn');
    const homeBtn = document.getElementById('homeBtn');
    const searchContainer = document.querySelector('.search-container');
    
    // In the favorites button click handler, update the searchContainer.innerHTML part
    if (isShowingFavorites) {
    favoritesBtn.classList.add('active');
    homeBtn.classList.remove('active');
    
    const actionButtons = userFavorites.length > 0 ? `
        <div class="favorites-actions">
            <button class="action-btn remove-selected" onclick="removeSelectedFavorites()">
                <i class="fas fa-minus-circle"></i> Remove Selected
            </button>
            <button class="action-btn remove-all" onclick="clearAllFavorites()">
                <i class="fas fa-trash"></i> Remove All
            </button>
        </div>
    ` : '';

    searchContainer.innerHTML = `
        <div class="favorites-header">
            <h2>My Favorite Recipes</h2>
        </div>
        ${actionButtons}
    `;
    displayRecipes(favoritedRecipes, true);
} else {
        favoritesBtn.classList.remove('active');
        homeBtn.classList.add('active');
        searchContainer.innerHTML = originalSearchContainerHTML;
        displayRecipes(popularRecipes);
    }
});

function displayRecipes(recipesToShow, isPopular = true) {
    const container = document.getElementById('recipesContainer');
    const favoritesActions = document.querySelector('.favorites-actions');
    container.innerHTML = '';

    // Show/hide action buttons based on favorites
    if (favoritesActions) {
        if (recipesToShow.length > 0 && isShowingFavorites) {
            favoritesActions.classList.add('has-favorites');
        } else {
            favoritesActions.classList.remove('has-favorites');
        }
    }

    if (!isUserLoggedIn() && !isPopular) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-lock"></i>
                <h2 class="message">Please Login</h2>
                <p class="sub-message">Sign in to access your favorite recipes!</p>
            </div>`;
        return;
    }

    if (recipesToShow.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-heart-broken"></i>
                <h2 class="message">No Recipes Found</h2>
                <p class="sub-message">Start building your collection!</p>
                <p class="hint">Click the heart icon on recipes you love to add them here.</p>
            </div>`;
        return;
    }

    recipesToShow.forEach(recipe => {
        const isFavorited = isInFavorites(recipe.id);
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.recipeId = recipe.id;
        
        card.innerHTML = `
            <img src="${recipe.image_url}" alt="${recipe.name}" class="recipe-image">
            <div class="recipe-info">
                <h3>${recipe.name}</h3>
                <p>${recipe.cuisine_type} | ${recipe.course}</p>
            </div>
            <div class="recipe-buttons">
                <button class="view-recipe" onclick="showRecipeModal('${recipe.id}')">View Recipe</button>
                <button class="favorite" onclick="toggleFavorite('${recipe.id}')">
                    <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Add this function at the top
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function toggleFavorite(recipeId) {
    if (!isUserLoggedIn()) {
        showToast('Please login to save favorites!');
        return;
    }

    const userEmail = localStorage.getItem('email');
    let userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');

    const index = userFavorites.indexOf(recipeId);
    if (index === -1) {
        userFavorites.push(recipeId);
        showToast('Recipe added to favorites!');
    } else {
        userFavorites.splice(index, 1);
        showToast('Recipe removed from favorites!');
        
        if (isShowingFavorites) {
            // Immediately remove the card from view
            const card = document.querySelector(`.recipe-card[data-recipe-id="${recipeId}"]`);
            if (card) {
                card.remove();
                
                // Check if there are any remaining cards
                const remainingCards = document.querySelectorAll('.recipe-card');
                if (remainingCards.length === 0) {
                    const actionsContainer = document.querySelector('.favorites-actions-container');
                    if (actionsContainer) actionsContainer.remove();
                    displayRecipes([], true);
                }
            }
        }
    }

    localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(userFavorites));
    
    // Update heart icons
    const heartIcons = document.querySelectorAll(`[data-recipe-id="${recipeId}"] .fa-heart`);
    heartIcons.forEach(icon => {
        icon.className = index === -1 ? 'fas fa-heart' : 'far fa-heart';
    });
}

function updateFavoriteUI(recipeId) {
    const heartIcons = document.querySelectorAll(`[data-recipe-id="${recipeId}"] .fa-heart`);
    const isFavorited = isInFavorites(recipeId);
    heartIcons.forEach(icon => {
        icon.className = isFavorited ? 'fas fa-heart' : 'far fa-heart';
    });
}

function isInFavorites(recipeId) {
    if (!isUserLoggedIn()) return false;
    const userEmail = localStorage.getItem('email');
    const userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
    return userFavorites.includes(recipeId);
}

// Remove the old addToFavorites and isInFavorites functions at the bottom of the file
// Add click handler for recipe card selection
document.addEventListener('click', function(e) {
    if (e.target.closest('.recipe-card') && isShowingFavorites) {
        const card = e.target.closest('.recipe-card');
        if (!e.target.closest('.favorite') && !e.target.closest('.view-recipe')) {
            card.classList.toggle('selected');
        }
    }
});

function clearAllFavorites() {
    const userEmail = localStorage.getItem('email');
    const userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');
    
    if (userFavorites.length === 0) {
        showToast('No favorites to remove');
        return;
    }

    showConfirmModal('Remove all recipes from favorites?', () => {
        localStorage.setItem(`favorites_${userEmail}`, '[]');
        showToast('All recipes removed from favorites');
        displayRecipes([], true);
    });
}

function removeSelectedFavorites() {
    const selectedCards = document.querySelectorAll('.recipe-card.selected');
    
    if (selectedCards.length === 0) {
        showToast('Please select recipes to remove');
        return;
    }

    showConfirmModal(`Remove ${selectedCards.length} selected recipe(s) from favorites?`, () => {
        const userEmail = localStorage.getItem('email');
        let userFavorites = JSON.parse(localStorage.getItem(`favorites_${userEmail}`) || '[]');

        selectedCards.forEach(card => {
            const recipeId = card.dataset.recipeId;
            const index = userFavorites.indexOf(recipeId);
            if (index !== -1) {
                userFavorites.splice(index, 1);
            }
        });
        
        localStorage.setItem(`favorites_${userEmail}`, JSON.stringify(userFavorites));
        showToast('Selected recipes removed from favorites');
        
        const favoritedRecipes = recipes.filter(recipe => userFavorites.includes(recipe.id));
        displayRecipes(favoritedRecipes, true);
    });
}


function showConfirmModal(message, callback) {
    const modal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    confirmMessage.textContent = message;
    modal.style.display = 'block';

    const handleYes = () => {
        modal.style.display = 'none';
        callback();
        cleanup();
    };

    const handleNo = () => {
        modal.style.display = 'none';
        cleanup();
    };

    const cleanup = () => {
        confirmYes.removeEventListener('click', handleYes);
        confirmNo.removeEventListener('click', handleNo);
    };

    confirmYes.addEventListener('click', handleYes);
    confirmNo.addEventListener('click', handleNo);

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            cleanup();
        }
    };

    // Move updateLandingButtons outside and make it globally accessible
    function updateLandingButtons() {
        const authBtns = document.querySelectorAll('.auth-btn');
        const skipBtn = document.querySelector('.skip-btn');
        
        if (isUserLoggedIn()) {
            authBtns.forEach(btn => btn.classList.remove('show'));
            if (skipBtn) {
                skipBtn.textContent = 'Get Started';
                skipBtn.classList.add('logged-in');
            }
        } else {
            authBtns.forEach(btn => btn.classList.add('show'));
            if (skipBtn) {
                skipBtn.textContent = 'Skip & Get Started';
                skipBtn.classList.remove('logged-in');
            }
        }
    }

    // Call this function when page loads and after login/logout
    updateLandingButtons();
}
