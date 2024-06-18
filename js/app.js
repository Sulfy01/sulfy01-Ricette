document.addEventListener('DOMContentLoaded', function() {
  const recipesList = document.getElementById('recipes-list');

  fetch('recipes/recipes.json')
    .then(response => response.json())
    .then(recipes => {
      recipes.forEach(recipe => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `recipes/recipe.html?title=${encodeURIComponent(recipe.title)}`;
        link.textContent = recipe.title;
        li.appendChild(link);
        recipesList.appendChild(li);
      });
    })
    .catch(error => {
      console.error('Error fetching recipes:', error);
    });
});
