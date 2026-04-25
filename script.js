tableau.extensions.initializeAsync().then(function () {
    console.log("Sistema AJE Preparado");
    fetchTableauData();
});

function fetchTableauData() {
    // 1. Buscamos la hoja de trabajo en tu dashboard
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    // Cambia "tree" por "prueba" si prefieres usar la otra hoja
    const worksheet = dashboard.worksheets.find(ws => ws.name === "tree");

    if (!worksheet) {
        document.getElementById('tree-container').innerHTML = 
            "<h2 style='color:white;'>Error: No encontré la hoja llamada 'tree'</h2>";
        return;
    }

    // 2. Obtenemos los datos completos (Full Data)
    worksheet.getSummaryDataAsync().then(function (sumdata) {
        const data = transformData(sumdata);
        renderProfessionalTree(data);
    });
}

function transformData(sumdata) {
    // Aquí convertimos las filas de Tableau en una estructura de árbol
    // Asumiremos que tu primera columna es Categoría y la segunda Marca
    let hierarchy = { name: "AJE Corporativo", children: [] };

    sumdata.data.forEach(row => {
        const catName = row[0].formattedValue; // Nivel 1
        const brandName = row[1].formattedValue; // Nivel 2
        const value = row[2].value; // Métrica (Venta/Cuota)

        // Lógica simple de agrupación
        let category = hierarchy.children.find(c => c.name === catName);
        if (!category) {
            category = { name: catName, children: [] };
            hierarchy.children.push(category);
        }
        category.children.push({ name: brandName, value: value });
    });

    return hierarchy;
}

function renderProfessionalTree(data) {
    const container = document.getElementById('tree-container');
    container.innerHTML = "<h2 style='color:white; text-align:center;'>Árbol de Ventas AJE Activo</h2>";
    
    // Aquí se integra la librería D3.js para dibujar los nodos.
    // Por ahora, mostraremos la estructura detectada para validar:
    const debugInfo = document.createElement('pre');
    debugInfo.style.color = "#00ff88";
    debugInfo.style.padding = "20px";
    debugInfo.innerText = JSON.stringify(data, null, 2);
    container.appendChild(debugInfo);
}
