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
    document.getElementById('recipe-image').src = "../images/" + recipe.title + "/last.jpg"

    const infoList = document.getElementById('recipe-info-list');

    infoList.innerHTML = `
      <li>Categoria: ${recipe.type}</li>
      <li id="recipe-time">Tempo: ${recipe.time}</li>
      <li id ="recipe-diners" data-diners="${recipe.diners[0]}">Dosi: ${recipe.diners[0]} ${recipe.diners[1]}</li>
    `;

    if (recipe.source === "web") {
      const externalLink = document.getElementById('external-link');
      externalLink.href = recipe.link;
      externalLink.textContent = externalLink.href.substring(externalLink.href.indexOf('//') + 2, externalLink.href.indexOf('/', 10))

      const youtubeVideo = document.getElementById('youtube-video');
      if (!recipe.video)
        youtubeVideo.style.display = "none"
      else {
        youtubeVideo.src = `https://www.youtube.com/embed/${recipe.video}`;
        document.getElementById('source-content').style.display = 'block';
      }
    } else {
      document.getElementById('external-link').style.display = "none"
      document.getElementById('youtube-video').style.display = "none"
      document.getElementById('alternative-source').textContent = recipe.source
    }

    const toolsList = document.getElementById('tools-list');

    toolsList.innerHTML = '';
    recipe.tools.forEach(tool => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" id="${tool}" onchange="checkLi(this)"> <label for="${tool}">${tool}</label>`;
      toolsList.appendChild(li);
    });

    const ingredientsList = document.getElementById('ingredients-list');
    const baseIngredientSelect = document.getElementById('base-ingredient');
    ingredientsList.innerHTML = '';
    baseIngredientSelect.innerHTML = '';
    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.className = 'ingredient-list-item';
      li.innerHTML = `
        <input type="checkbox" id="${ingredient.name}" onchange="checkLi(this)">
        <label for="${ingredient.name}">${ingredient.name}</label>
        <div class="ingredient-amount-unit">
          <span class="ingredient-amount" data-quantity="${ingredient.amount}">${ingredient.amount}</span> 
          <span class="ingredient-unit">${ingredient.unit}</span>
        </div>
      `;
      ingredientsList.appendChild(li);

      const option = document.createElement('option');
      option.value = ingredient.amount;
      option.textContent = ingredient.name.includes("</a>") ?
          decodeURI(ingredient.name.substring(ingredient.name.lastIndexOf("=")+1, ingredient.name.lastIndexOf("\'"))) :
          ingredient.name;
      baseIngredientSelect.appendChild(option);
    });
    const option = document.createElement('option');
    option.value = recipe.diners;
    option.textContent = "Dosi"
    baseIngredientSelect.appendChild(option);

    const procedureList = document.getElementById('procedure-list');
    procedureList.innerHTML = '';
    recipe.procedure.forEach(step => {
      const li = document.createElement('li');
      li.innerHTML = `<img src="../images/${recipe.title}/${step.image}" alt=""><div style="white-space: pre-wrap">${step.step}</div>`;
      procedureList.appendChild(li);
    });

    window.checkLi = function(checkbox) {
      const checkboxLi = checkbox.parentElement;

      if (checkbox.checked) {
        checkboxLi.classList.add("checked")
      } else {
        checkboxLi.classList.remove("checked")
      }
      checkAllChecked(checkbox)
    }
    function checkAllChecked(checkbox) {
      const checkboxes = checkbox.parentElement.parentElement
      const allChecked = Array.from(checkboxes.children).every(checkbox => checkbox.className.includes("checked"));

      if (allChecked) {
        checkboxes.parentElement.style.display = "none"
      }
    }
    window.toggleTools = function() {
      const toolsContent = document.getElementById('tools-content');
      if (toolsList.hasChildNodes() || toolsContent.style.display === 'block') {
        toolsContent.style.display = toolsContent.style.display === 'block' ? 'none' : 'block';
      }
    }
    window.toggleIngredients = function() {
      const ingredientsContent = document.getElementById('ingredients-content');
      ingredientsContent.style.display = ingredientsContent.style.display === 'block' ? 'none' : 'block';
    }
    window.toggleSource = function() {
      const sourceContent = document.getElementById('source-content');
      sourceContent.style.display = sourceContent.style.display === 'block' ? 'none' : 'block';
    }
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
      const dinersElement = document.getElementById('recipe-diners');
      if (dinersElement) {
        const originalDiners = parseInt(dinersElement.getAttribute('data-diners'), 10);
        const newDiners = (originalDiners * multiplier).toFixed(1);
        dinersElement.textContent = `Dosi: ${newDiners} ` + dinersElement.textContent.split(" ").slice(-1)[0];
        dinersElement.setAttribute('data-diners', newDiners.toString());
      }
    }
  }
});


