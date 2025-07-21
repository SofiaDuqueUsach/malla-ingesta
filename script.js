// Asume que tienes cargado el JSON como "data" (lista de ramos)
// Y que cada ramo tiene: id, nombre, creditos, prerrequisitos (array), tipo ("bachiller", "licenciatura", "ingenieria")

let completados = JSON.parse(localStorage.getItem('completados')) || [];

columna.className = "nivel"; // ya los estilos están definidos en CSS


function renderizarMalla(data) {
  const mallaContainer = document.getElementById("malla");
  mallaContainer.innerHTML = "";

  const niveles = agruparPorNivel(data);

  niveles.forEach((ramos, nivel) => {
    const columna = document.createElement("div");
    columna.className = "nivel";
    columna.style.backgroundColor = "#acd3f5";
    columna.style.border = "2px solid #b9cffa";
    columna.style.color = "#291B72";
    columna.style.flex = "0 0 auto";
    columna.style.width = "220px";
    columna.style.padding = "10px";
    columna.style.borderRadius = "10px";
    columna.style.boxShadow = "2px 2px 8px rgba(0,0,0,0.15)";
    columna.style.transition = "background-color 0.3s ease";

    columna.addEventListener("mouseover", () => {
      columna.style.backgroundColor = "#9e8bff";
    });
    columna.addEventListener("mouseout", () => {
      columna.style.backgroundColor = "#acd3f5";
    });

    const titulo = document.createElement("h3");
    titulo.textContent = `Nivel ${nivel}`;
    titulo.style.textAlign = "center";
    titulo.style.marginBottom = "10px";
    titulo.style.fontSize = "1.1rem";
    columna.appendChild(titulo);

    let creditosNivel = 0;

    ramos.forEach((ramo) => {
      const div = document.createElement("div");
      div.id = `ramo-${ramo.id}`;
      div.className = `ramo ${ramo.tipo}`;
      div.textContent = `${ramo.nombre} (${ramo.creditos})`;

      if (completados.includes(ramo.id)) {
        div.classList.add("completado", "aprobado");
      } else if (!puedeCursar(ramo)) {
        div.classList.add("bloqueado");
      }

      div.addEventListener("click", () => {
        if (div.classList.contains("bloqueado")) return;
        if (completados.includes(ramo.id)) {
          completados = completados.filter(id => id !== ramo.id);
        } else {
          completados.push(ramo.id);
        }
        localStorage.setItem("completados", JSON.stringify(completados));
        renderizarMalla(data);
        actualizarProgreso(data);
      });

      creditosNivel += ramo.creditos;
      columna.appendChild(div);
    });

    const creditosDiv = document.createElement("div");
    creditosDiv.className = "creditos-nivel";
    creditosDiv.textContent = `${creditosNivel} créditos`;
    creditosDiv.style.textAlign = "center";
    creditosDiv.style.fontSize = "0.9rem";
    creditosDiv.style.fontWeight = "bold";
    creditosDiv.style.marginTop = "8px";
    columna.appendChild(creditosDiv);

    mallaContainer.appendChild(columna);
  });
}

function agruparPorNivel(data) {
  const niveles = new Map();
  data.forEach(r => {
    if (!niveles.has(r.nivel)) niveles.set(r.nivel, []);
    niveles.get(r.nivel).push(r);
  });
  return new Map([...niveles.entries()].sort((a, b) => a[0] - b[0]));
}

function puedeCursar(ramo) {
  return ramo.prerrequisitos.every(pr => completados.includes(pr));
}

function actualizarProgreso(data) {
  const totalCred = data.reduce((acc, r) => acc + r.creditos, 0);
  const credHechos = data.filter(r => completados.includes(r.id)).reduce((a, b) => a + b.creditos, 0);
  const porcentaje = Math.round((credHechos / totalCred) * 100);
  const semestresFaltan = Math.ceil((totalCred - credHechos) / 30);

  document.getElementById("barraProgreso").style.width = `${porcentaje}%`;
  document.getElementById("barraProgreso").textContent = `${porcentaje}%`;

  document.getElementById("infoProgreso").textContent =
    `${credHechos} / ${totalCred} créditos completados\n` +
    `${porcentaje}% completado\n` +
    `Te faltan aproximadamente ${semestresFaltan} semestres`;
}

fetch("data_malla_transformado.json")
  .then(res => res.json())
  .then(json => {
    window.data = json;
    renderizarMalla(json);
    actualizarProgreso(json);
  });
