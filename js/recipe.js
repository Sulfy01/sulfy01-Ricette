document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('title');

  fetch('recipes.json')
    .then(response => response.json())
    .then(recipes => {
      const recipe = recipes.find(recipe => recipe.title === recipeId);
      if (recipe) {
        displayRecipe(recipe);
      } else {
        console.error('Recipe not found');
      }
    })
    .catch(error => {
      console.error('Error fetching recipe:', error);
    });

  function displayRecipe(recipe) {
    document.getElementById('recipe-title').textContent = recipe.title;
    document.title = recipe.title;

    const toolsList = document.getElementById('tools-list');
    toolsList.innerHTML = '';
    recipe.tools.forEach(tool => {
      const li = document.createElement('li');
      li.textContent = tool;
      toolsList.appendChild(li);
    });

    const ingredientsList = document.getElementById('ingredients-list');
    const baseIngredientSelect = document.getElementById('base-ingredient');
    ingredientsList.innerHTML = '';
    baseIngredientSelect.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="ingredient-amount" data-quantity="${ingredient.amount}">${ingredient.amount}</span> <span class="ingredient-unit">${ingredient.unit}</span> <span class="ingredient-name">${ingredient.name}</span>`;
      ingredientsList.appendChild(li);

      const option = document.createElement('option');
      option.value = ingredient.amount;
      option.textContent = ingredient.name;
      baseIngredientSelect.appendChild(option);
    });

    const procedureList = document.getElementById('procedure-list');
    procedureList.innerHTML = '';
    recipe.procedure.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `<img src="${step.image}" alt=""><span>${step.step}</span>`;
      procedureList.appendChild(li);
    });

    const externalLink = document.getElementById('external-link');
    externalLink.href = recipe.link;

    const youtubeVideo = document.getElementById('youtube-video');
    youtubeVideo.src = `https://www.youtube.com/embed/${recipe.video}`;
  }

  window.updateQuantities = function() {
    const baseIngredientSelect = document.getElementById('base-ingredient');
    const newQuantityInput = document.getElementById('new-quantity');
    const selectedIngredientAmount = parseFloat(baseIngredientSelect.value);
    const newQuantity = parseFloat(newQuantityInput.value);

    if (!isNaN(selectedIngredientAmount) && !isNaN(newQuantity) && selectedIngredientAmount > 0) {
      const multiplier = newQuantity / selectedIngredientAmount;
      document.querySelectorAll('.ingredient-amount').forEach(span => {
        const originalQuantity = parseFloat(span.getAttribute('data-quantity'));
        if (!isNaN(originalQuantity)) {
          span.textContent = (originalQuantity * multiplier).toFixed(2);
        }
      });
    }
  }
});

// function updateQuantities() {
//   const baseQuantity = parseFloat(document.getElementById('base-ingredient').value);
//   const newQuantity = parseFloat(document.getElementById('new-quantity').value);
//   const ratio = newQuantity / baseQuantity;
//
//   const ingredientAmounts = document.querySelectorAll('.ingredient-amount');
//
//   ingredientAmounts.forEach(ingredient => {
//     const baseAmount = parseFloat(ingredient.getAttribute('data-quantity'));
//     if (!isNaN(baseAmount)) {
//       const newAmount = baseAmount * ratio;
//       ingredient.textContent = newAmount.toFixed(2);
//     }
//   });
// }
