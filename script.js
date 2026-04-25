let i = 0;
let root;
const nodeWidth = 160;
const nodeHeight = 40;

tableau.extensions.initializeAsync().then(() => {
    console.log("Sistema AJE Preparado con Parámetros");
    fetchTableauData();
});

function fetchTableauData() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheet = dashboard.worksheets.find(ws => ws.name === "tree" || ws.name === "prueba");

    if (!worksheet) {
        document.getElementById('tree-container').innerHTML = 
            "<h2 style='color:white; text-align:center;'>Error: Hoja 'tree' no encontrada</h2>";
        return;
    }

    worksheet.getSummaryDataAsync().then(sumdata => {
        const loading = document.getElementById('loading-text');
        if (loading) loading.style.display = 'none';

        const data = transformData(sumdata);
        renderProfessionalTree(data);
    });
}

function transformData(sumdata) {
    let hierarchy = { name: "AJE Total", value: 0, children: [] };
    
    sumdata.data.forEach(row => {
        const catName = row[0].formattedValue || "N/D"; 
        const brandName = row[1].formattedValue || "N/D";
        const value = row[2] ? row[2].value : 0; 

        let category = hierarchy.children.find(c => c.name === catName);
        if (!category) {
            category = { name: catName, children: [], value: 0 };
            hierarchy.children.push(category);
        }
        category.children.push({ name: brandName, value: value });
        category.value += value;
        hierarchy.value += value;
    });

    return hierarchy;
}

function renderProfessionalTree(data) {
    const container = document.getElementById('tree-container');
    container.innerHTML = ""; 
    
    const width = container.offsetWidth;
    const height = 800;

    const svg = d3.select("#tree-container").append("svg")
        .attr("width", "100%")
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50, 50)");

    root = d3.hierarchy(data);
    root.x0 = height / 2;
    root.y0 = 0;

    // Colapsar todos los hijos por defecto (UX de Infotopics)
    if (root.children) {
        root.children.forEach(collapse);
    }

    update(root, svg);
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function update(source, svg) {
    const treeLayout = d3.tree().nodeSize([60, 200]);
    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    // --- NODOS ---
    const node = svg.selectAll("g.node")
        .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${source.y0},${source.x0})`)
        .on("click", (event, d) => {
            // Acción 1: Expandir/Colapsar
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            
            // Acción 2: Actualizar Parámetro en Tableau
            const pathValue = d.data.name;
            tableau.extensions.dashboardContent.dashboard.findParameterAsync("AJE_Selected_Path").then(param => {
                if(param) param.changeValueAsync(pathValue);
            });

            update(d, svg);
        });

    // Rectángulo de la Tarjeta
    nodeEnter.append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("y", -nodeHeight / 2)
        .attr("rx", 5)
        .style("fill", "#fff")
        .style("stroke", "#00d4ff")
        .style("stroke-width", "2px");

    // Texto del Nombre
    nodeEnter.append("text")
        .attr("x", 10)
        .attr("y", -5)
        .style("fill", "#333")
        .style("font-weight", "bold")
        .style("font-size", "11px")
        .text(d => d.data.name);

    // Barra de Progreso Interna (UX Visual)
    nodeEnter.append("rect")
        .attr("x", 10)
        .attr("y", 5)
        .attr("width", 140)
        .attr("height", 6)
        .attr("rx", 3)
        .style("fill", "#eee");

    nodeEnter.append("rect")
        .attr("x", 10)
        .attr("y", 5)
        .attr("width", d => {
            const ratio = d.data.value / root.data.value;
            return Math.max(2, ratio * 140);
        })
        .attr("height", 6)
        .attr("rx", 3)
        .style("fill", "#00d4ff");

    // --- TRANSICIONES ---
    const nodeUpdate = nodeEnter.merge(node);
    nodeUpdate.transition().duration(500)
        .attr("transform", d => `translate(${d.y},${d.x})`);

    const nodeExit = node.exit().transition().duration(500)
        .attr("transform", d => `translate(${source.y},${source.x})`)
        .remove();

    // --- LINKS (Líneas) ---
    const link = svg.selectAll("path.link")
        .data(links, d => d.target.id);

    const linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", d => {
            const o = {x: source.x0, y: source.y0};
            return d3.linkHorizontal().x(d => d.y).y(d => d.x)({source: o, target: o});
        })
        .style("fill", "none")
        .style("stroke", "#555")
        .style("stroke-width", "1.5px");

    link.merge(linkEnter).transition().duration(500)
        .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

    link.exit().transition().duration(500)
        .attr("d", d => {
            const o = {x: source.x, y: source.y};
            return d3.linkHorizontal().x(d => d.y).y(d => d.x)({source: o, target: o});
        })
        .remove();

    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}
