document.addEventListener('DOMContentLoaded', function() {
  const antipastiList = document.getElementById('antipasti-list');
  const primiList = document.getElementById('primi-list');
  const secondiList = document.getElementById('secondi-list');
  const contorniList = document.getElementById('contorni-list');
  const dolciList = document.getElementById('dolci-list');
  const preparazioniList = document.getElementById('preparazioni-list');

  fetch('recipes/recipes.json')
    .then(response => response.json())
    .then(recipes => {
      recipes.sort((a, b) => a.title.localeCompare(b.title));
      recipes.forEach(recipe => {
        const li = document.createElement('li');
        const link = document.createElement('a');

        link.textContent = (recipe.title.includes(" by ") ? '⭐ ' :  '') + recipe.title;
        link.href = `recipes/recipe.html?title=${encodeURIComponent(recipe.title)}`;
        li.appendChild(link);

        switch (recipe.type) {
          case "Antipasto":
            antipastiList.appendChild(li);
            break;
          case "Primo":
            primiList.appendChild(li);
            break;
          case "Secondo":
            secondiList.appendChild(li);
            break;
          case "Contorno":
            contorniList.appendChild(li);
            break;
          case "Dolce":
            dolciList.appendChild(li);
            break;
          case "Preparazione":
            preparazioniList.appendChild(li);
            break;
        }
      });
    })
    .catch(error => {
      console.error('Error fetching recipes:', error);
    });
});

//search recipe: display only the good ones