document.addEventListener("DOMContentLoaded", function() {
    // Inicializar la extensión de Tableau
    tableau.extensions.initializeAsync().then(function() {
        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = 'none';
        
        // Aquí obtenemos los datos del dashboard
        fetchDataAndRender();
    });
});

function fetchDataAndRender() {
    const worksheet = tableau.extensions.dashboardContent.dashboard.worksheets[0];
    
    worksheet.getSummaryDataAsync().then(function(sumdata) {
        // Lógica de transformación de datos de Tableau a Jerarquía JSON
        const data = transformToHierarchy(sumdata);
        renderTree(data);
    });
}

function renderTree(data) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(100,0)");

    const tree = d3.tree().size([height, width - 200]);
    const root = d3.hierarchy(data);
    tree(root);

    // Dibujar las líneas (links)
    svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Dibujar los nodos
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    node.append("circle").attr("r", 8);
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name);
}

// Función auxiliar para convertir filas de Tableau en árbol
function transformToHierarchy(sumdata) {
    // Esta función debe adaptarse según tus columnas (Marca, Formato, SKU)
    // Por ahora devuelve un ejemplo estructural
    return {
        name: "Ventas AJE",
        children: [
            { name: "Big Cola", children: [{name: "3L"}, {name: "600ml"}] },
            { name: "Volt", children: [{name: "Lata 473ml"}, {name: "Botella"}] }
        ]
    };
}
