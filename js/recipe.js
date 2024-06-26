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
    const title = (recipe.title.includes(" by ") ? '⭐ ' : '') + recipe.title;
    document.getElementById('recipe-title').textContent = title
    document.title = title

    displayHead(recipe);
    displayWeb(recipe);
    displayTools(recipe);
    displayIngredients(recipe);
    displayProcedure(recipe);
  }
  function displayHead(recipe) {
    document.getElementById('recipe-image').src = "../images/" + recipe.title + "/last.jpg"

    document.getElementById('recipe-type-value').textContent = recipe.type;
    document.getElementById('recipe-time-value').textContent = recipe.time;
    document.getElementById('recipe-diners-quantity').textContent = recipe.diners.quantity;
    document.getElementById('recipe-diners-unit').textContent = recipe.diners.unit;
  }
  function displayWeb(recipe) {
    if (recipe.source === "web") {
      const externalLink = document.getElementById('external-link');
      externalLink.href = recipe.link;
      externalLink.textContent = externalLink.href.substring(externalLink.href.indexOf('//') + 2, externalLink.href.indexOf('/', 10))

      if (!recipe.video)
        document.getElementById("yt-container").style.display = "none";
      else {
        document.getElementById('youtube-video').src = `https://www.youtube.com/embed/${recipe.video}`;
        document.getElementById('source-content').style.display = 'block';
      }
    } else {
      document.getElementById('external-link').style.display = "none"
      document.getElementById("yt-container").style.display = "none";
    }
  }
  function displayTools(recipe) {
    const toolsList = document.getElementById('tools-list');
    toolsList.innerHTML = '';

    recipe.tools.forEach(tool => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" id="${tool}" onchange="checkLi(this)"> <label for="${tool}">${tool}</label>`;
      toolsList.appendChild(li);
    });
  }
  function displayIngredients(recipe) {
    const ingredientsList = document.getElementById('ingredients-list');
    const baseIngredientSelect = document.getElementById('base-ingredient');
    ingredientsList.innerHTML = '';
    baseIngredientSelect.innerHTML = '';

    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.className = 'ingredient-list-item';

      const isRecipeLink = ingredient.isRecipe ?
          `<a href="recipe.html?title=${encodeURIComponent(ingredient.name)}">${ingredient.name}</a>` :
          ingredient.name;

      li.innerHTML = `
        <input type="checkbox" id="${ingredient.name}" onchange="checkLi(this)">
        <label for="${ingredient.name}">${isRecipeLink}</label>
        <div class="ingredient-amount-unit">
          <span class="ingredient-amount" data-quantity="${ingredient.amount}">${ingredient.amount}</span> 
          <span class="ingredient-unit">${ingredient.unit}</span>
        </div>
      `;

      ingredientsList.appendChild(li);

      //base ingredient select
      const option = document.createElement('option');
      option.value = ingredient.amount;
      option.textContent = ingredient.name;
      baseIngredientSelect.appendChild(option);
    });

    //option based on diners
    const option = document.createElement('option');
    option.value = recipe.diners;
    option.textContent = "Dosi"
    baseIngredientSelect.appendChild(option);
  }
  function displayProcedure(recipe) {
    const procedureList = document.getElementById('procedure-list');
    procedureList.innerHTML = '';
    recipe.procedure.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `<img src="../images/${recipe.title}/${step.image}" alt=""><div style="white-space: pre-wrap">${step.step}</div><hr>`;
      procedureList.appendChild(li);
    });
  }
});

function toggleTools(){
  const toolsContent = document.getElementById('tools-content');
  toolsContent.style.display = toolsContent.style.display === 'block' ? 'none' : 'block';
}
function toggleIngredients () {
  const ingredientsContent = document.getElementById('ingredients-content');
  ingredientsContent.style.display = ingredientsContent.style.display === 'block' ? 'none' : 'block';
}
function toggleSource () {
  const sourceContent = document.getElementById('source-content');
  sourceContent.style.display = sourceContent.style.display === 'block' ? 'none' : 'block';
}

function checkLi(checkbox) {
  const checkboxLi = checkbox.parentElement;
  checkbox.checked ? checkboxLi.classList.add("checked") : checkboxLi.classList.remove("checked")
  checkAllChecked(checkbox)
}
function checkAllChecked(checkbox) {
  const checkboxes = checkbox.parentElement.parentElement
  const allChecked = Array.from(checkboxes.children).every(checkbox => checkbox.className.includes("checked"));

  if (allChecked) {
    checkboxes.parentElement.style.display = "none"
  }
}

function updateQuantities () {
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
    const dinersQuantity = document.getElementById('recipe-diners-quantity');
    const originalDiners = parseInt(dinersQuantity.textContent, 10);
    const newDiners = (originalDiners * multiplier).toFixed(1);
    dinersQuantity.textContent = newDiners.toString();
  }
}
