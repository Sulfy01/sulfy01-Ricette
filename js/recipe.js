document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('title');
  let intermediateTot = 0;

  fetch('recipes.json')
    .then(response => response.json())
    .then(recipes => {
      allRecipes = recipes;
      const recipe = recipes.find(recipe => recipe.title === recipeId);
      if (recipe) {
        fetchIntermediate(recipes, recipe)
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
    document.getElementById('recipe-image').src = "../images/" + recipe.type + "/" + recipe.title + "/last.jpg"

    displayWeb(recipe);
    displayTools(recipe);
    displayHead(recipe);
    displayIngredients(recipe);
    displayProcedure(recipe);
  }
  function createTime(type, time) {
    const h = Math.floor(time / 60);
    const m = time % 60;
    let res = "";
    if (h !== 0) res = h + "h ";
    if (m!== 0) res += m + "m";

    const li = document.createElement('li');

    li.innerHTML = `
          ${type}: <span>${res}</span>
    `;
    return li;
  }
  function displayHead(recipe) {
    document.getElementById('recipe-type-value').textContent = recipe.type;
    document.getElementById('recipe-diners-quantity').textContent = recipe.diners.quantity;
    document.getElementById('recipe-diners-unit').textContent = recipe.diners.unit;

    const infoList = document.getElementById('recipe-info-list');
    let tot = 0;
    if (recipe.time.preparazione) {
      const time = castNumber(recipe.time.preparazione);
      infoList.appendChild(createTime("Preparazione", time));
      tot += time;
    }
    if (recipe.time.cottura) {
      const time = castNumber(recipe.time.cottura);
      infoList.appendChild(createTime("Cottura", time));
      tot += time;
    }
    if (recipe.time.riposo) {
      const time = castNumber(recipe.time.riposo);
      infoList.appendChild(createTime("Riposo", time));
      tot += time;
    }

    if (intermediateTot !== 0) {
      infoList.appendChild(createTime("Intermedi", intermediateTot));
      tot += intermediateTot
    }
    infoList.appendChild(createTime("Tempo totale", tot));
  }
  function displayWeb(recipe) {
    const externalLink = document.getElementById('external-link');
    if (recipe.source === "web") {
      if (!recipe.link) {
        externalLink.style.display = "none"
      } else {
        externalLink.href = recipe.link;
        externalLink.textContent = externalLink.href.substring(externalLink.href.indexOf('//') + 2, externalLink.href.indexOf('/', 10))
      }

      if (!recipe.video)
        document.getElementById("yt-container").style.display = "none";
      else {
        document.getElementById('youtube-video').src = `https://www.youtube.com/embed/${recipe.video}`;
      }
    } else {
      const div = document.createElement('div');
      div.textContent = recipe.source;
      document.getElementById('source-content').appendChild(div);

      externalLink.style.display = "none"
      document.getElementById("yt-container").style.display = "none";
    }
  }
  function displayTools(recipe) {
    const toolsList = document.getElementById('tools-list');
    toolsList.innerHTML = '';

    let tooCont = 0;
    recipe.tools.forEach(tool => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" id="${tool}-${tooCont}" onchange="checkLi(this)"> <label for="${tool}-${tooCont}">${tool}</label>`;
      toolsList.appendChild(li);
      tooCont++;
    });
  }
  function displayIngredients(recipe) {
    const ingredientsList = document.getElementById('ingredients-list');
    const baseIngredientSelect = document.getElementById('base-ingredient');
    ingredientsList.innerHTML = '';
    baseIngredientSelect.innerHTML = '';

    let ingCont = 0;
    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.className = 'ingredient-list-item';

      const isRecipeLink = ingredient.isRecipe ?
          `<a href="recipe.html?title=${encodeURIComponent(ingredient.name)}" target="_blank">${ingredient.name}</a>` :
          ingredient.name;

      li.innerHTML = `
        <input type="checkbox" id="${ingredient.name}-${ingCont}" onchange="checkLi(this)">
        <label for="${ingredient.name}-${ingCont}">${isRecipeLink}</label>
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

      ingCont++;
    });

    //option based on diners
    const option = document.createElement('option');
    option.value = recipe.diners;
    option.textContent = "Dosi"
    baseIngredientSelect.appendChild(option);
  }

  function fetchIntermediate (recipes, recipe) {
    recipe.ingredients.forEach(ingredient => {
      const recipe = recipes.find(recipe => recipe.title === ingredient.name);
      if (recipe) {
        intermediateTot += castNumber(recipe.time.preparazione) + castNumber(recipe.time.cottura) + castNumber(recipe.time.riposo)
        fetchIntermediate(recipes, recipe);
      }
    });
  }

  function displayProcedure(recipe) {
    const procedureList = document.getElementById('procedure-list');
    procedureList.innerHTML = '';
    recipe.procedure.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `<img src="../images/${recipe.type}/${recipe.title}/${step.image}" alt=""><div style="white-space: pre-wrap">${step.step}</div><hr>`;
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

function castNumber (a) {
  if (a) return Number(a)
  else return 0
}