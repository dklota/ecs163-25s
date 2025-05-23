let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 30, right: 30, bottom: 30, left: 80},
    scatterWidth = 600 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 400 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 0, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 700 - distrMargin.left - distrMargin.right,
    distrHeight = 500 - distrMargin.top - distrMargin.bottom;

let barLeft = 0, barTop = 0;
let barMargin = {top: 20, right: 30, bottom: 30, left: 60},
    barWidth = 700 - barMargin.left - barMargin.right,
    barHeight = 400 - barMargin.top - barMargin.bottom;;

let sankeyLeft = 0, sankeyTop = 800;
let sankeyMargin = { top: 20, right: 30, bottom: 20, left: 30 },
    sankeyWidth = 700 - sankeyMargin.left - sankeyMargin.right,
    sankeyHeight = 350;

// plots
d3.csv("data/cosmetics.csv").then(rawData =>{
    console.log("rawData", rawData);

    rawData.forEach(function(d){
        d.Label = String(d.Label);
        d.Brand = String(d.Brand);
        d.Name = String(d.Name);
        d.Price = Number(d.Price);
        d.Rank = Number(d.Rank);
        d.Ingredients = String(d.Ingredients);
        d.Combination = Number(d.Combination);
        d.Normal = Number(d.Normal);
        d.Oily = Number(d.Oily);
        d.Sensitive = Number(d.Sensitive);
    });


    const filteredData = rawData.filter(d=>d.Label=="Moisturizer");
    const processedData = filteredData.map(d=>{
                          return {
                              "Price":d.Price,
                              "Brand":d.Brand,
                              "Name":d.Name,
                              "Combination":d.Combination,
                              "Oily":d.Oily,
                              "Normal":d.Normal,
                              "Sensitive":d.Sensitive,
                              "IngredientsCount": d.Ingredients.split(',').length,
                              "SkinType":getSkinType(d)
                          };
    });

    // find the SkinType for each product (used in scatter plot)
    function getSkinType(d) {
        const types = [
            { type: "Oily", value: d.Oily },
            { type: "Normal", value: d.Normal },
            { type: "Combination", value: d.Combination },
            { type: "Sensitive", value: d.Sensitive }
        ];
        types.sort((a, b) => b.value - a.value);
        return types[0].type; // return the value that is at the top of the array after sorting all types
    }
    
    console.log("processedData", processedData);

    /*-----------------------Plot 1: Scatter Plot-------------------------*/
    //plot 1: Scatter Plot
    //const svg = d3.select("svg");

    // dashboard title - need to split using tspan to move text to newline

    const g1 = d3.select("#scatter-plot")
        .append("svg")
        //.attr("id", "scatter-group")
        .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right + 120)
        .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom + 80)

    const g1Inner = g1.append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    // X label
    g1Inner.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", scatterHeight + 70)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text("Price");

    // Y label
    g1Inner.append("text")
        .attr("x", -scatterHeight / 2)
        .attr("y", -scatterMargin.left + 30)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Ingredient Count");
        
    // X ticks
    const x1 = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.Price)])
        .range([0, scatterWidth]);

    const xAxisCall = d3.axisBottom(x1)
         .ticks(7);

    const xAxis = g1Inner.append("g")
         .attr("class", "x-axis")
         .attr("transform", `translate(0, ${scatterHeight})`)
         .call(xAxisCall);
       
    xAxis.selectAll("text")
         .attr("y", "10")
         .attr("x", "-5")
         .attr("text-anchor", "end")
         .attr("transform", "rotate(-40)");

    // Y ticks
    const y1 = d3.scaleLinear()
        .domain([0, d3.max(processedData, d => d.IngredientsCount)])
        .range([scatterHeight, 0]);

    const yAxisCall = d3.axisLeft(y1)
        .ticks(13);

    const yAxis = g1Inner.append("g")
        .attr("class", "y-axis")
        .call(yAxisCall);

    const originalX = x1.copy();
    const originalY = y1.copy();

    g1Inner.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("x", 0)
        .attr("y", -20)
        .attr("width", scatterWidth)
        .attr("height", scatterHeight + 20);
        
    const scatterGroup = g1Inner.append("g")
        .attr("clip-path", "url(#clip)");

    //create color scale based on skin type to differentiate color of circles on plot
    const colorScale = d3.scaleOrdinal()
    .domain(["Oily", "Normal", "Combination", "Sensitive"])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

    // create a legend for the scatter plot
    const legendGroup = g1.append("g")
        .attr("transform", `translate(${scatterMargin.left + scatterWidth + 20}, ${scatterMargin.top})`);

    //add text label for each skin type in the legend item
    const legend = legendGroup.selectAll(".legend-item")
        .data(colorScale.domain())
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

    //create circle for each skin type for legend
    legend.append("circle")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 7)
        .attr("fill", d => colorScale(d));

    //add text next to each corresponding circle
    legend.append("text")
        .attr("x", 15)
        .attr("y", 5)
        .attr("font-size", "14px")
        .text(d => d);

    // HW3 addition of filtering: option to click the legend item and it filters to show only that data on the scatter plot
    let selectedSkin = null;
    
    legend.on("click", function(event, d) {
        if (selectedSkin === d) {
            selectedSkin = null;
            scatterGroup.selectAll("circle")
                .transition().duration(400)
                .style("opacity", 1);
        } else {
            selectedSkin = d;
            scatterGroup.selectAll("circle")
                .transition().duration(500)
                .style("opacity", e => e.SkinType === selectedSkin ? 1 : 0.1);
        }
    });

    // define d3.brush()
    const brush = d3.brush()
    .extent([[0, 0], [scatterWidth, scatterHeight]])
    .on("end", brushed);

    scatterGroup.append("g")
        .attr("class", "brush")
        .call(brush);

    // create the points
    const dots = scatterGroup.selectAll("circle")
        .data(processedData)
        .enter().append("circle")
        .attr("cx", d => x1(d.Price))
        .attr("cy", d => y1(d.IngredientsCount))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.SkinType))
        .attr("class", d => `dot ${d.SkinType}`);
    

    // handle the brush with a brushed function
    function brushed(event) {
        if (!event.selection) return;

        const [[x0, y0], [x1Sel, y1Sel]] = event.selection;
        x1.domain([x0, x1Sel].map(x1.invert));
        y1.domain([y1Sel, y0].map(y1.invert));

        xAxis.transition().duration(1000).call(d3.axisBottom(x1));
        yAxis.transition().duration(1000).call(d3.axisLeft(y1));

        g1Inner.select(".x-axis")
            .transition().duration(1000)
            .call(d3.axisBottom(x1));

        g1Inner.select(".y-axis")
            .transition().duration(1000)
            .call(d3.axisLeft(y1));

        // Update only clipped circles
        scatterGroup.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", d => x1(d.Price))
            .attr("cy", d => y1(d.IngredientsCount));

        g1Inner.select(".brush").call(brush.move, null); // clears the brush
    }

    // create a reset button for users to revert to the start
    const resetButton = document.createElement("button");
        resetButton.textContent = "Reset Zoom";
        resetButton.id = "reset-button";
        document.getElementById("scatter-plot").appendChild(resetButton);

    resetButton.addEventListener("click", () => {
        x1.domain(originalX.domain());
        y1.domain(originalY.domain());

        xAxis.transition().duration(1000).call(d3.axisBottom(x1));
        yAxis.transition().duration(1000).call(d3.axisLeft(y1));

        g1Inner.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", d => x1(d.Price))
            .attr("cy", d => y1(d.IngredientsCount));
    });

    /*-----------------------Plot 2: Bar Chart-------------------------*/
    //create the next svg group for bar chart and define const g2
    const g2 = d3.select("#bar-chart")
        .append("svg")
        .attr("width", distrWidth + distrMargin.left + distrMargin.right)
        .attr("height", distrHeight + distrMargin.top + distrMargin.bottom)
        .attr("transform", `translate(${distrLeft}, ${distrTop})`);

    //plot 2: Bar Chart for Count of Products per Skin Type

    // calculate the count of each product by skin type using d3.sum: computes the sum of an array of numbers
    const skinTypeCounts = [
        { skin: "Oily", count: d3.sum(processedData, d => d.Oily) },
        { skin: "Normal", count: d3.sum(processedData, d => d.Normal) },
        { skin: "Combination", count: d3.sum(processedData, d => d.Combination) },
        { skin: "Sensitive", count: d3.sum(processedData, d => d.Sensitive) }
        ];
    console.log("Skin Type Counts:", skinTypeCounts); 

    // creates a new svg group gBar used for the bar chart to position margins
    const gBar = g2.append("g")
        .attr("id", "bar-group")
        .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

    // x-axis
    gBar.append("text")
    .attr("x", barWidth / 2.1)
    .attr("y", barHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Skin Type");

    // y-axis
    gBar.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -35)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Product Count");

    // x-axis scale using d3.scaleBand -> used for bar charts as mentioned in the d3js website
    const x2 = d3.scaleBand()
    .domain(skinTypeCounts.map(d => d.skin))
    .range([0, barWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2);
    
    //draw and position x-axis
    const xAxisCall2 = d3.axisBottom(x2);
    gBar.append("g")
        .attr("transform", `translate(0, ${barHeight})`)
        .call(xAxisCall2)
        .selectAll("text")
            .attr("y", "10")
            .attr("x", "-5")
            .attr("font-size", "14px")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-40)");

    // y-axis scale
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(skinTypeCounts, d => d.count)])
    .range([barHeight, 0])
    .nice();

    // draw and position y-axis
    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6);

    gBar.append("g").call(yAxisCall2);

    // bars
    const bars = gBar.selectAll("rect").data(skinTypeCounts);

    // const tooltip div that allows us to create the interaction
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // creates one blue block per skin type for the bar chart in relation to the data
    // HW 3: added mouseover and mouseout that will allow a user to hover over the bar to view the count
    bars.enter().append("rect")
        .attr("y", d => y2(d.count))
        .attr("x", d => x2(d.skin))
        .attr("width", x2.bandwidth())
        .attr("height", d => barHeight - y2(d.count))
        .attr("class", "bar")
        .attr("fill", "steelblue")
        .on("mouseover", function(event, d) {
            tooltip.transition().duration(500).style("opacity", .7);
            tooltip.html(`Count: ${d.count}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(this).attr("fill", "green");
        })
        .on("mouseout", function() {
            tooltip.transition().duration(500).style("opacity", 0);
            d3.select(this).attr("fill", "steelblue");
        });

    /*-----------------------Plot 3: Sankey Diagram-------------------------*/

    // group g4 defined as another svg object for the Sankey Diagram
    const g4 = d3.select("#sankey-diagram")
        .append("svg")
        .attr("width", sankeyWidth + sankeyMargin.left + sankeyMargin.right)
        .attr("height", sankeyHeight + sankeyMargin.top + sankeyMargin.bottom);
    
    const gSankey = g4.append("g")
        .attr("transform", `translate(${sankeyMargin.left + 100}, ${sankeyMargin.top})`);
        
    //create mapping for skincounts, skintypes, and the frequency of ingredients
    const ingredientSkinCounts = {};
    const skinTypes = ["Oily", "Normal", "Combination", "Sensitive"];
    const ingredientFreq = {};
    
    // conduct the mapping, split ingredients (delimiter is ,), add the ingredient to ingredientSkinCounts and ingredientFreq (both key-value pairs)
    filteredData.forEach(d => {
        const ingredients = d.Ingredients.split(',').map(i => i.trim());
        skinTypes.forEach(type => {
        if (d[type] === 1) {
            ingredients.forEach(ingredient => {
                const key = `${ingredient}|${type}`;
                ingredientSkinCounts[key] = (ingredientSkinCounts[key] || 0) + 1;
                ingredientFreq[ingredient] = (ingredientFreq[ingredient] || 0) + 1;
                });
            }
        });
    });

    // select the top 10 ingredients based on frequency
    const topIngredients = Object.entries(ingredientFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(entry => entry[0]);
    
    // create nodes using the top ingredients and the skin types - what we will see on the diagram
    const nodes = [...topIngredients, ...skinTypes].map(name => ({ name }));
    const nodeIndex = {};
    nodes.forEach((n, i) => { nodeIndex[n.name] = i; });
    
    // create links that connect the ingredients with the skin type 
    const links = [];
    for (const key in ingredientSkinCounts) {
        const [ingredient, skin] = key.split('|');
        if (topIngredients.includes(ingredient)) {
            links.push({
                source: nodeIndex[ingredient],
                target: nodeIndex[skin],
                value: ingredientSkinCounts[key]
            });
        }
    }
    
    // init sankey using nodes and links
    const sankeyData = { nodes, links };

    // create the sankey diagram using d3.sankey 
    const sankeyLayout = d3.sankey()
        .nodeWidth(15)
        .nodePadding(10)
        .extent([[0, 0], [500, 350]])(sankeyData);

    // append to g4 svg and create the rectangles for the nodes in sankey
    gSankey.selectAll("rect")
        .data(sankeyLayout.nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#000");
    
    // append to svg g4 and create the links between nodes in the sankey diagram 
    gSankey.selectAll("path")
        .data(sankeyLayout.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#aaa")
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("fill", "none")
        .attr("opacity", 0.5);

    // label each node a.k.a. the top ingredients and the skin type
    gSankey.selectAll("text")
        .data(sankeyLayout.nodes)
        .enter().append("text")
        .attr("font-size", "14px")
        .attr("x", d => d.x0 - 10)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name);
    
    // calculate the total flow = the sum of all link values, using d3.sum function 
    const totalNodeFlow = d3.sum(sankeyLayout.links, d => d.value);

    // for each node, label the percentage next to it, placed left or right based on if its an ingredient or a skin type
    gSankey.append("svg")
    .selectAll("text")
    .data(sankeyLayout.nodes)
    .enter().append("text")
    .attr("font-size", "13px")
    .attr("x", d => d.x0 < 250 ? d.x1 + 6 : d.x0 + 60)
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => d.x0 < 250 ? "start" : "end")
    .text(d => {
        const nodeValue = d.value;
        const pct = (nodeValue / totalNodeFlow) * 100;
        return `${pct.toFixed(1)}%`;
    });


    }).catch(function(error){
    console.log(error);
});