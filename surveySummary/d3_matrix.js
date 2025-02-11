// Code inspired by https://bost.ocks.org/mike/miserables/

document.addEventListener("DOMContentLoaded", function () {
  const data = window.clusterData; // 🔹 Get data from `index.html`

  var margin = { top: 80, right: 0, bottom: 10, left: 120 },
      width = Math.max(720, data.nodes.length * 25),
      height = Math.max(720, data.nodes.length * 25);

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
      matrix[link.source][link.target].z += link.value;
      matrix[link.target][link.source].z += link.value;
      matrix[link.source][link.source].z += link.value;
      matrix[link.target][link.target].z += link.value;
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
      var cell = d3.select(this).selectAll(".cell")
          .data(rowData.filter(d => d.z))
          .enter().append("rect")
          .attr("class", "cell")
          .attr("x", d => x(d.x))
          .attr("width", x.bandwidth())
          .attr("height", x.bandwidth())
          .style("fill-opacity", d => z(d.z))
          .style("fill", d => nodes[d.x].group === nodes[d.y].group ? c(nodes[d.x].group) : null)
          .on("mouseover", mouseover)
          .on("mouseout", mouseout);
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
      order("count");
      d3.select("#order").property("selectedIndex", 1).node().focus();
  }, 5000);
});
