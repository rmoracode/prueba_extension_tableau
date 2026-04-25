// Esperar a que Tableau se inicialice
tableau.extensions.initializeAsync().then(function () {
    console.log("Extensión de AJE inicializada correctamente");
    
    // Aquí definimos los datos de prueba de AJE para ver si el árbol dibuja
    const dataAJE = [
        { "Categoria": "Gaseosas", "Marca": "Big Cola", "Métrica": 4565304 },
        { "Categoria": "Gaseosas", "Marca": "Volt", "Métrica": 2215741 },
        { "Categoria": "Agua", "Marca": "Cielo", "Métrica": 1321911 }
    ];

    renderTree(dataAJE);
}, function (err) {
    console.error("Error al inicializar: " + err.toString());
});

function renderTree(data) {
    const container = document.getElementById('tree-container');
    if (!container) return;

    // Limpiamos el contenedor
    container.innerHTML = "";

    // Creamos un título simple para verificar que el JS está corriendo
    const title = document.createElement('h2');
    title.style.color = "white";
    title.style.textAlign = "center";
    title.innerText = "Árbol Estratégico AJE - Vista Preliminar";
    container.appendChild(title);

    // Aquí iría tu lógica de D3.js para el árbol. 
    // Por ahora, listamos las marcas para confirmar que ves algo en pantalla:
    const list = document.createElement('ul');
    list.style.color = "#00d4ff";
    list.style.fontSize = "20px";
    
    data.forEach(item => {
        const li = document.createElement('li');
        li.innerText = item.Marca + ": " + item.Métrica.toLocaleString();
        list.appendChild(li);
    });
    
    container.appendChild(list);
}
