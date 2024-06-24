function addTool() {
    const toolInput = document.createElement('input');
    toolInput.type = 'text';
    toolInput.name = 'tools';
    document.getElementById('tools-list').appendChild(toolInput);
}

function addIngredient() {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient';
    ingredientDiv.innerHTML = `
        <hr>
        <input type="text" name="ingredient-name" placeholder="Nome">
        <div class="ingredient-details">
            <input type="number" name="ingredient-amount" placeholder="Quantità (se indefinita lasciare vuoto)">
            <input type="text" name="ingredient-unit" placeholder="Unità di misura">
        </div>
    `;
    document.getElementById('ingredients-list').appendChild(ingredientDiv);
}

function addStep() {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'procedure-step';
    stepDiv.innerHTML = `
        <textarea name="step" placeholder="Step" rows="5"></textarea>
    `;
    document.getElementById('procedure-list').appendChild(stepDiv);
}

function generateAndDownloadJSON() {
    if (!checkRequiredFields()) {
        alert('Compila tutti i cambi richiesti!');
        return;
    }

    const formData = new FormData(document.getElementById('recipe-form'));
    const recipe = {
        title: formData.get('title'),
        type: formData.get('type'),
        time: formData.get('time'),
        diners: [
            formData.get('diners-quantity'), formData.get('diners-unit')
        ],
        tools: [],
        ingredients: [],
        procedure: [],
        source: formData.get('source'),
        link: formData.get('link'),
        video: parseVideoId(formData.get('video'))
    };

    document.querySelectorAll('#tools-list input').forEach(input => {
        recipe.tools.push(input.value);
    });

    const ingredientsList = document.querySelectorAll('#ingredients-list .ingredient');
    ingredientsList.forEach((ingredient) => {
        const name = ingredient.querySelector('input[name="ingredient-name"]').value;
        let amount = ingredient.querySelector('input[name="ingredient-amount"]').value;
        if (!amount) amount = "q.b."
        const unit = ingredient.querySelector('input[name="ingredient-unit"]').value;
        recipe.ingredients.push({ name, amount, unit });
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