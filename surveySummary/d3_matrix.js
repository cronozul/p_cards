// Code inspired by https://bost.ocks.org/mike/miserables/

document.addEventListener("DOMContentLoaded", function () {
  const data = window.clusterData; // 🔹 Get data from `index.html`
  const valueKeys = Object.keys(data.columnCounts);
const numCols = data.columnCounts[valueKeys[0]].length;
let numRows = 0;
// iterate over dictionary data.columnCounts add up element i of values in dict 
for (const key in data.columnCounts) {
  if (data.columnCounts.hasOwnProperty(key)) {
    numRows += data.columnCounts[key][0];
  }
}
console.log("Number of rows:", numRows);

const valueMatrix = valueKeys.map((val, i) =>
  d3.range(numCols).map(j => ({
    x: j,
    y: i,
    z: data.columnCounts[val][j],
  }))
);

  var margin = { top: 250, right: 0, bottom: 100, left: 250 };
      width = Math.max(500, data.nodes.length * 10),
      height = Math.max(500, data.nodes.length * 10);

  var x = d3.scaleBand().range([0, width]).domain(d3.range(data.nodes.length)),
      z = d3.scaleLinear().domain([0, d3.max(data.links, d => d.value)]).clamp(true),
      c = d3.scaleOrdinal(d3.schemeCategory10);

  var svg = d3.select("#matrix-container").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  var matrix = [],
      nodes = data.nodes.map((name, i) => ({ name, index: i, count: 0 })),
      n = nodes.length;

  nodes.forEach((node, i) => {
      matrix[i] = d3.range(n).map(j => ({ x: j, y: i, z: 0 }));
  });

  data.links.forEach(link => {
    //   matrix[link.source][link.target].z += link.value;
    //   matrix[link.target][link.source].z += link.value;
    //   matrix[link.source][link.source].z += link.value;
    //   matrix[link.target][link.target].z += link.value;
    matrix[link.source][link.target].z += link.value;
    matrix[link.target][link.source].z += link.value;
    

      nodes[link.source].count += link.value;
      nodes[link.target].count += link.value;
  });

  var orders = {
      name: d3.range(n).sort((a, b) => d3.ascending(nodes[a].name, nodes[b].name)),
      count: d3.range(n).sort((a, b) => nodes[b].count - nodes[a].count),
  };

  x.domain(orders.name);

  svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

  var row = svg.selectAll(".row")
      .data(matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", (d, i) => `translate(0, ${x(i)})`)
      .each(drawRow);

  row.append("line")
      .attr("x2", width);

  row.append("text")
      .attr("x", -6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text((d, i) => nodes[i].name);

  // 🔹 FIXED COLUMN ROTATION (Only Rotate the Column Group)
  var column = svg.selectAll(".column")
      .data(matrix)
      .enter().append("g")
      .attr("class", "column")
      .attr("transform", (d, i) => `translate(${x(i)}) rotate(-90)`);

  column.append("line")
      .attr("x1", -width);

  column.append("text")
      .attr("x", 6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .text((d, i) => nodes[i].name);

  function drawRow(rowData) {
  const row = d3.select(this);

  // Draw the cells
  const cells = row.selectAll(".cell")
    .data(rowData.filter(d => d.z))
    .enter();

  cells.append("rect")
    .attr("class", "cell")
    .attr("x", d => x(d.x))
    .attr("width", x.bandwidth())
    .attr("height", x.bandwidth())
    .style("fill-opacity", d => z(d.z))
    .style("fill", d => nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null)
    .on("mouseover", mouseover)
    .on("mouseout", mouseout);

  // Add value as text if it fits
  cells.append("text")
    .filter(() => x.bandwidth() >= 12) // Only show text if cell is wide enough
    .attr("x", d => x(d.x) + x.bandwidth() / 2)
    .attr("y", x.bandwidth() / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .style("fill", "black")
    .style("font-size", "10px")
    .text(d =>parseInt(d.z / numRows * 100) )// Display value as a fraction of the total number of rows
  }

  function mouseover(p) {
      d3.selectAll(".row text").classed("active", (d, i) => i === p.y);
      d3.selectAll(".column text").classed("active", (d, i) => i === p.x);
  }

  function mouseout() {
      d3.selectAll("text").classed("active", false);
  }

  d3.select("#order").on("change", function () {
      clearTimeout(timeout);
      order(this.value);
  });

  function order(value) {
      x.domain(orders[value]);

      var t = svg.transition().duration(2500);

      t.selectAll(".row")
          .delay((d, i) => x(i) * 4)
          .attr("transform", (d, i) => `translate(0, ${x(i)})`)
          .selectAll(".cell")
          .delay(d => x(d.x) * 4)
          .attr("x", d => x(d.x));

      t.selectAll(".column")
          .delay((d, i) => x(i) * 4)
          .attr("transform", (d, i) => `translate(${x(i)}) rotate(-90)`);
  }

var timeout = setTimeout(function () {
  const orderSelect = d3.select("#order").node();
  if (orderSelect && orderSelect.selectedIndex === 0) {
    order("count");
    orderSelect.selectedIndex = 1;
    orderSelect.focus();
  }
}, 50000);


//   second matrix sizes
var y2 = d3.scaleBand().range([0, valueKeys.length * 20]).domain(d3.range(valueKeys.length));
var x2 = d3.scaleBand().range([0, numCols * 20]).domain(d3.range(numCols));
var z2 = d3.scaleLinear()
  .domain([0, d3.max(Object.values(data.columnCounts).flat())])
  .clamp(true);
  
//   var svg = d3.select("#matrix-container").append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//   var svg2 = d3.select("#matrix-container").append("svg")
//     .attr("width", x2.range()[1] + 200)
//     .attr("height", y2.range()[1] + 100)
//     .append("g")
//     .attr("transform", "translate(100,50)");

  var svg2 = d3.select("#matrix-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

svg2.append("rect")
    .attr("class", "background")
    .attr("width", x2.range()[1])
    .attr("height", y2.range()[1]);

var row2 = svg2.selectAll(".row2")
    .data(valueMatrix)
    .enter().append("g")
    .attr("class", "row2")
    .attr("transform", (d, i) => `translate(0, ${y2(i)})`)
    .each(drawRow2);

row2.append("text")
    .attr("x", -6)
    .attr("y", y2.bandwidth() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "end")
    .text((d, i) => valueKeys[i]);

var col2 = svg2.selectAll(".col2")
    .data(valueMatrix[0])
    .enter().append("g")
    .attr("class", "col2")
    .attr("transform", (d, i) => `translate(${x2(i)}) rotate(-90)`);

col2.append("text")
    .attr("x", 6)
    .attr("y", x2.bandwidth() / 2)
    .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .text((d, i) => nodes[i].name);

// function drawRow2(rowData) {
//     d3.select(this).selectAll(".cell2")
//         .data(rowData.filter(d => d.z))
//         .enter().append("rect")
//         .attr("class", "cell2")
//         .attr("x", d => x2(d.x))
//         .attr("width", x2.bandwidth())
//         .attr("height", y2.bandwidth())
//         .style("fill-opacity", d => z2(d.z))
//         .style("fill", "#69b3a2");

// }
function drawRow2(rowData) {
    const cell = d3.select(this).selectAll(".cell2")
        .data(rowData.filter(d => d.z))
        .enter();

    // Draw rect
    cell.append("rect")
        .attr("class", "cell2")
        .attr("x", d => x2(d.x))
        .attr("width", x2.bandwidth())
        .attr("height", y2.bandwidth())
        .style("fill-opacity", d => z2(d.z))
        .style("fill", "#69b3a2");

    // Add text label if it fits
    cell.append("text")
        .attr("x", d => x2(d.x) + x2.bandwidth() / 2)
        .attr("y", y2.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .style("font-size", "10px")
        .style("pointer-events", "none")
        .style("fill", "black")
        .text(d => {
            const value = d.z;
            return value > 0 ? parseInt(100 * value / numRows) : "";
        });
        // .text(d => parseInt(d.z.toFixed(2) / numRows * 100));
    }


});
