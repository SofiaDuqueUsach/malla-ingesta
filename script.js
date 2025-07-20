function toggleRamo(el) {
  el.classList.toggle("completado");
  guardarEstado();
  actualizarProgreso();
}

function guardarEstado() {
  const ramos = document.querySelectorAll('.ramo');
  const estado = [];
  ramos.forEach((ramo, i) => {
    estado.push(ramo.classList.contains("completado"));
  });
  localStorage.setItem("estadoRamos", JSON.stringify(estado));
}

function cargarEstado() {
  const ramos = document.querySelectorAll('.ramo');
  const estado = JSON.parse(localStorage.getItem("estadoRamos"));
  if (estado) {
    ramos.forEach((ramo, i) => {
      if (estado[i]) {
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
  const porcentaje = (completados / total) * 100;
  document.getElementById("barra").style.width = porcentaje + "%";
}

window.onload = cargarEstado;
