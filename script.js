tableau.extensions.initializeAsync().then(function () {
    console.log("Sistema AJE Preparado");
    fetchTableauData();
});

function fetchTableauData() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    
    // Intenta buscar en "tree" o en "prueba" por si acaso
    const worksheet = dashboard.worksheets.find(ws => ws.name === "tree" || ws.name === "prueba");

    if (!worksheet) {
        document.getElementById('tree-container').innerHTML = 
            "<h2 style='color:white; text-align:center;'>Error: No encontré la hoja 'tree' o 'prueba'</h2>";
        return;
    }

    worksheet.getSummaryDataAsync().then(function (sumdata) {
        // Ocultamos el mensaje de carga del HTML
        const loading = document.getElementById('loading-text');
        if (loading) loading.style.display = 'none';

        const data = transformData(sumdata);
        renderProfessionalTree(data);
    });
}

function transformData(sumdata) {
    let hierarchy = { name: "AJE Corporativo", children: [] };

    sumdata.data.forEach(row => {
        const catName = row[0].formattedValue || "N/D"; 
        const brandName = row[1].formattedValue || "N/D";
        const value = row[2] ? row[2].value : 0; 

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
    container.innerHTML = ""; // Limpiamos todo

    const width = container.offsetWidth || 800;
    const height = 600;

    // Crear el SVG
    const svg = d3.select("#tree-container").append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(120, 20)");

    // Configurar el layout del árbol
    const treeLayout = d3.tree().size([height - 100, width - 300]);
    const root = d3.hierarchy(data);
    treeLayout(root);

    // Dibujar las líneas (links)
    svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x))
        .attr("fill", "none")
        .attr("stroke", "#00d4ff")
        .attr("stroke-width", 1.5)
        .attr("opacity", 0.6);

    // Crear los nodos
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("transform", d => `translate(${d.y},${d.x})`);

    // Círculos de los nodos
    node.append("circle")
        .attr("r", d => d.depth === 0 ? 8 : 5)
        .attr("fill", d => d.depth === 0 ? "#fff" : (d.children ? "#00d4ff" : "#00ff88"))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);

    // Etiquetas de texto
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -15 : 15)
        .style("text-anchor", d => d.children ? "end" : "start")
        .style("fill", "white")
        .style("font-family", "sans-serif")
        .style("font-size", "11px")
        .style("text-shadow", "1px 1px 2px #000")
        .text(d => d.data.name);
}
