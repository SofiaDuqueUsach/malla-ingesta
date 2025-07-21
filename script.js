const URL_MALLA = "data_malla_transformado.json";

let malla = [];
let completados = new Set();
let conexiones = [];

document.addEventListener("DOMContentLoaded", async () => {
  malla = await cargarMalla();
  renderizarMalla(malla);
  configurarSelector();
});

async function cargarMalla() {
  const res = await fetch(URL_MALLA);
  return await res.json();
}

function renderizarMalla(data) {
  const mallaContainer = document.getElementById("malla");
  mallaContainer.innerHTML = "";

  const niveles = agruparPorNivel(data);

  niveles.forEach((ramos, nivel) => {
    const columna = document.createElement("div");
    columna.className = "nivel";
    const titulo = document.createElement("h3");
    titulo.textContent = `Nivel ${nivel}`;
    columna.appendChild(titulo);

    let creditosNivel = 0;

    ramos.forEach((ramo) => {
      const div = document.createElement("div");
      div.id = `ramo-${ramo.id}`;
      div.className = `ramo ${ramo.tipo}`;
      div.textContent = `${ramo.nombre} (${ramo.creditos})`;

      // Marca como completado visual
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

    const selector = document.getElementById("selectorVista");
    selector.addEventListener("change", () => {
      if (selector.value === "todos") {
        renderizarMalla(json);
      } else {
        const filtrado = json.filter(r => r.nivel == selector.value);
        renderizarMalla(filtrado);
      }
      actualizarProgreso(json);
    });
  });

