let allIngredients = [];
let allRecipes = [];
let ingredientCont = 0;
document.addEventListener('DOMContentLoaded', function() {
    fetch('utils/ingredients.txt')
        .then(r => r.text())
        .then(text => {
            allIngredients = text.split("\r\n")
        })
        .catch(error => {
            console.error('Error fetching ingredients:', error);
        });
    fetch('recipes/recipes.json')
        .then(response => response.json())
        .then(recipes => {
            recipes.sort((a, b) => a.title.localeCompare(b.title));
            recipes.forEach(recipe => {
                allRecipes.push(recipe.title)
            })
            addIngredient();
        })
        .catch(error => {
            console.error('Error fetching recipes:', error);
        });
});

function addIngredient() {
    ingredientCont++;
    const ingredientsListDiv = document.getElementById('ingredients-list');

    const newIngredientDiv  = document.createElement('div');
    newIngredientDiv.className = 'ingredient';

    const ingredientDetailsNameDiv = document.createElement('div');
    ingredientDetailsNameDiv.classList.add('ingredient-details');

    const ingredientInput = document.createElement('input');
    ingredientInput.type = 'text';
    ingredientInput.name = `ingredient-name`;
    ingredientInput.placeholder = 'Nome';
    const datalistId = `selectIngredient-${ingredientCont}`;
    ingredientInput.setAttribute('list', datalistId);

    const ingredientDatalist = document.createElement('datalist');
    ingredientDatalist.id = datalistId;

    fillIngredientOptions(ingredientDatalist)
    ingredientDetailsNameDiv.appendChild(ingredientInput);
    ingredientDetailsNameDiv.appendChild(ingredientDatalist);

    const ingredientDetailsAmountDiv = document.createElement('div');
    ingredientDetailsAmountDiv.classList.add('ingredient-details');

    const amountInput = document.createElement('input');
    amountInput.type = 'number';
    amountInput.name = `ingredient-amount`;
    amountInput.placeholder = 'Quantità (se indefinita lasciare vuoto)';

    const unitInput = document.createElement('input');
    unitInput.type = 'text';
    unitInput.name = `ingredient-unit`;
    unitInput.placeholder = 'Unità di misura';

    ingredientDetailsAmountDiv.appendChild(amountInput);
    ingredientDetailsAmountDiv.appendChild(unitInput);

    // Append both ingredient-details divs to the new ingredient div
    newIngredientDiv.appendChild(ingredientDetailsNameDiv);
    newIngredientDiv.appendChild(ingredientDetailsAmountDiv);
    newIngredientDiv.appendChild(document.createElement('hr'))

    // Append the new ingredient div to the ingredients list
    ingredientsListDiv.appendChild(newIngredientDiv);
}
function fillIngredientOptions(dataList) {
    allIngredients.forEach(ingredient => {
        const option = document.createElement('option');
        option.value = ingredient
        option.textContent = ingredient
        dataList.appendChild(option);
    })
    allRecipes.forEach(recipe => {
        const option = document.createElement('option');
        option.value = recipe
        option.textContent = recipe
        dataList.appendChild(option);
    })
}

function addTool() {
    const toolInput = document.createElement('input');
    toolInput.type = 'text';
    toolInput.name = 'tools';
    document.getElementById('tools-list').appendChild(toolInput);
}
function addStep() {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'procedure-step';
    stepDiv.innerHTML = `
        <textarea name="step" placeholder="Step" rows="5"></textarea>
    `;
    document.getElementById('procedure-list').appendChild(stepDiv);
}

function showLinks(input) {
    document.getElementById('links').style.display = input.value.trim() === 'web' ? 'block' : 'none'
}

function generateAndDownloadJSON() {
    const formData = new FormData(document.getElementById('recipe-form'));

    if (allRecipes.includes(formData.get('title'))) {
        alert('Nome ricetta già presente!');
        return;
    }
    if (!checkRequiredFields()) {
        alert('Compila tutti i cambi richiesti!');
        return;
    }

    const recipe = {
        title: capitalizeFirstLetter(formData.get('title')),
        type: formData.get('type'),
        time: formData.get('time'),
        diners: {
            "quantity": formData.get('diners-quantity'), "unit": formData.get('diners-unit')
        },
        tools: [],
        ingredients: [],
        procedure: [],
        source: formData.get('source'),
        link: formData.get('source') === "web" && formData.get('link') ? formData.get('link') : '',
        video: formData.get('source') === "web" && formData.get('video') ? parseVideoId(formData.get('video')) : ''
    };

    document.querySelectorAll('#tools-list input').forEach(input => {
        recipe.tools.push(capitalizeFirstLetter(input.value));
    });
    document.querySelectorAll('#ingredients-list .ingredient').forEach((ingredient) => {
        let amount = ingredient.querySelector('input[name="ingredient-amount"]').value;
        if (!amount) amount = "q.b."
        const unit = ingredient.querySelector('input[name="ingredient-unit"]').value;

        let name = capitalizeFirstLetter(ingredient.querySelector('input[name="ingredient-name"]').value);
        if (allRecipes.includes(name)) {
            let isRecipe = "true";
            recipe.ingredients.push({ name, amount, unit, isRecipe });
        }else {
            recipe.ingredients.push({name, amount, unit});
        }
    });

    const procedureList = document.querySelectorAll('#procedure-list .procedure-step');
    procedureList.forEach((step, index) => {
        const stepDescription = step.querySelector('textarea[name="step"]').value;
        let stepImage;
        if (index === procedureList.length - 1) {
            stepImage = 'last.jpg';
        } else {
            stepImage = (index + 1) + '.jpg';
        }
        recipe.procedure.push({ step: stepDescription, image: stepImage });
    });

    const jsonString = JSON.stringify(recipe, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function parseVideoId(url) {
    const vIndex = url.indexOf('v=');
    if (vIndex === -1) {
        return null;
    }
    let videoId = url.substring(vIndex + 2);
    const ampersandIndex = videoId.indexOf('&');
    if (ampersandIndex !== -1) {
        videoId = videoId.substring(0, ampersandIndex);
    }
    return videoId;
}
function checkRequiredFields() {
    const requiredFields = document.querySelectorAll('#recipe-form [required]');
    for (const field of requiredFields) {
        if (!field.value.trim()) {
            return false;
        }
    }
    return true;
}
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}