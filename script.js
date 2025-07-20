function toggleRamo(el) {
  el.classList.toggle("completado");
  guardarEstado();
  actualizarProgreso();
}

function guardarEstado() {
  const ramos = document.querySelectorAll('.ramo');
  const estado = {};
  ramos.forEach((ramo) => {
    estado[ramo.dataset.codigo] = ramo.classList.contains("completado");
  });
  localStorage.setItem("estadoRamos", JSON.stringify(estado));
}

function cargarEstado() {
  const ramos = document.querySelectorAll('.ramo');
  const estado = JSON.parse(localStorage.getItem("estadoRamos"));
  if (estado) {
    ramos.forEach((ramo) => {
      if (estado[ramo.dataset.codigo]) {
        ramo.classList.add("completado");
      }
    });
  }
  actualizarProgreso();
}

function actualizarProgreso() {
  const ramos = document.querySelectorAll('.ramo');
  let total = 0;
  let completados = 0;
  ramos.forEach(r => {
    const c = parseInt(r.dataset.credito);
    total += c;
    if (r.classList.contains("completado")) {
      completados += c;
    }
  });
  document.getElementById("creditos").innerText = `${completados} / ${total} créditos completados`;
  document.getElementById("barra").style.width = (completados / total * 100) + "%";
}

function cambiarVista() {
  const seleccion = document.getElementById("selectorVista").value;
  const bloques = document.querySelectorAll(".semestre");
  bloques.forEach(b => {
    if (seleccion === "todos" || b.dataset.semestre === seleccion) {
      b.style.display = "block";
    } else {
      b.style.display = "none";
    }
  });
}

window.onload = cargarEstado;
