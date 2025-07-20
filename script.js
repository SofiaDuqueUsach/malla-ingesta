const URL_MALLA = "malla_estadistica_usach_2016.json";

let malla = [];
let completados = new Set();

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
  const contenedor = document.getElementById("malla");
  contenedor.innerHTML = "";

  const niveles = {};
  let totalCreditos = 0;
  let creditosCompletados = 0;

  // Organizar ramos por nivel
  data.forEach(ramo => {
    totalCreditos += ramo.creditos;
    if (completados.has(ramo.id)) creditosCompletados += ramo.creditos;

    if (!niveles[ramo.nivel]) niveles[ramo.nivel] = [];
    niveles[ramo.nivel].push(ramo);
  });

  // Dibujar niveles
  Object.keys(niveles).sort((a, b) => a - b).forEach(nivel => {
    const col = document.createElement("div");
    col.className = "nivel";
    col.setAttribute("data-nivel", nivel);

    const titulo = document.createElement("h3");
    titulo.textContent = `Nivel ${nivel}`;
    col.appendChild(titulo);

    niveles[nivel].forEach(ramo => {
      const div = document.createElement("div");
      div.className = `ramo ${ramo.tipo}`;
      div.textContent = ramo.nombre;
      div.title = `${ramo.nombre} (${ramo.creditos} créditos)`;

      if (completados.has(ramo.id)) {
        div.classList.add("completado");
      }

      div.addEventListener("click", () => {
        div.classList.toggle("completado");
        if (completados.has(ramo.id)) {
          completados.delete(ramo.id);
        } else {
          completados.add(ramo.id);
        }
        renderizarMalla(malla);
      });

      // Mostrar prerrequisitos por hover
      if (ramo.prerrequisitos.length > 0) {
        const prereq = document.createElement("div");
        prereq.className = "prerequisitos";
        prereq.innerText = "Requiere: " +
          ramo.prerrequisitos.map(id =>
            data.find(x => x.id === id)?.nombre || id
          ).join(", ");
        div.appendChild(prereq);
      }

      col.appendChild(div);
    });

    // Mostrar créditos por nivel
    const sumaNivel = niveles[nivel].reduce((sum, r) => sum + r.creditos, 0);
    const cred = document.createElement("div");
    cred.className = "creditos-nivel";
    cred.textContent = `${sumaNivel} créditos`;
    col.appendChild(cred);

    contenedor.appendChild(col);
  });

  // Barra de progreso
  const porcentaje = (creditosCompletados / totalCreditos) * 100;
  const faltanCreditos = totalCreditos - creditosCompletados;
  const semestresRestantes = Math.ceil(faltanCreditos / 30);
  document.getElementById("infoProgreso").innerText =
    `${creditosCompletados} / ${totalCreditos} créditos completados\n` +
    `${porcentaje.toFixed(0)}% completado\n` +
    `Te faltan aproximadamente ${semestresRestantes} semestres`;

  document.getElementById("barraProgreso").style.width = `${porcentaje}%`;
  document.getElementById("barraProgreso").innerText = `${porcentaje.toFixed(0)}%`;
}

function configurarSelector() {
  const selector = document.getElementById("selectorVista");
  selector.addEventListener("change", (e) => {
    const nivelSeleccionado = e.target.value;
    const niveles = document.querySelectorAll(".nivel");

    niveles.forEach(n => {
      if (nivelSeleccionado === "todos" || n.dataset.nivel === nivelSeleccionado) {
        n.style.display = "block";
      } else {
        n.style.display = "none";
      }
    });
  });
}
