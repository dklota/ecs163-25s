let abFilter = 25;
const width = window.innerWidth;
const height = window.innerHeight;

let scatterLeft = 0, scatterTop = 0;
let scatterMargin = {top: 40, right: 30, bottom: 30, left: 70},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let distrLeft = 400, distrTop = 0;
let distrMargin = {top: 10, right: 30, bottom: 30, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 350 - distrMargin.top - distrMargin.bottom;

let barLeft = 0, barTop = 400;
let barMargin = {top: 10, right: 30, bottom: 30, left: 60},
    barWidth = width - barMargin.left - barMargin.right,
    barHeight = height-450 - barMargin.top - barMargin.bottom;

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
    const svg = d3.select("svg");

    // dashboard title - need to split using tspan to move text to newline
    const title = svg.append("text")
        .attr("x", 900)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")

    title.append("tspan")
        .attr("x", 750)
        .attr("dy", "0.5em")
        .attr("font-size", "45px")
        .text("Cosmetics Dashboard:");
    
    title.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.7em")
        .attr("font-size", "30px")
        .text("Pricing, Ingredients, and Skin Type");
    
    //dashboard explanation - also use of tspan to move the text over to new lines
    const description = svg.append("text")
        .attr("x", 900)
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .attr("font-size", "17px")
    
    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "3em")
        .text("The Kaggle Cosmetics Dataset consists of several attributes");
    
    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.2em")
        .text("on skin type, products, list of ingredients, and price, to name");
    
    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.2em")
        .text(" a few. This dashboard explores the distribution of products");
    
    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.2em")
        .text("by skin type (normal, combination, oily, or sensitive), displays");

    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.2em")
        .text("the scatter of the number of ingredients vs. its product price,");
    
    description.append("tspan")
        .attr("x", 750)
        .attr("dy", "1.2em")
        .text("and the mapping of top ingredients to the skin type.");

    const g1 = svg.append("g")
                .attr("width", scatterWidth + scatterMargin.left + scatterMargin.right)
                .attr("height", scatterHeight + scatterMargin.top + scatterMargin.bottom)
                .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);
    
    //Scatter Plot Title
    g1.append("text")
        .attr("x", scatterWidth / 2)
        .attr("y", -18)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Price vs. Ingredient Count by Skin Type");

    // X label
    g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Price");

    // Y label
    g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
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

    g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
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
    g1.append("g").call(yAxisCall);

    // circles
    const circles = g1.selectAll("circle").data(processedData);

    //create color scale based on skin type to differentiate color of circles on plot
    const colorScale = d3.scaleOrdinal()
    .domain(["Oily", "Normal", "Combination", "Sensitive"])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

    //adds a circle svg element for each data point
    circles.enter().append("circle")
         .attr("cx", d => x1(d.Price))
         .attr("cy", d => y1(d.IngredientsCount))
         .attr("r", 5)
         .attr("fill", d => colorScale(d.SkinType)); // different circle colors by skin type
    
    // create a legend for the scatter plot
    const legendGroup = svg.append("g")
    .attr("transform", `translate(${scatterMargin.left + scatterWidth + 20}, ${scatterMargin.top + 40})`);

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

    /*-----------------------Plot 2: Bar Chart-------------------------*/
    //create the next svg group for bar chart and define const g2
    const g2 = svg.append("g")
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

    // creates a new svg group g3 used for the bar chart to position margins
    const g3 = svg.append("g")
                .attr("width", barWidth + barMargin.left + barMargin.right)
                .attr("height", barHeight + barMargin.top + barMargin.bottom)
                .attr("transform", `translate(${barMargin.left}, ${barTop})`);

    // x-axis
    g3.append("text")
    .attr("x", barWidth / 2)
    .attr("y", barHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Skin Type");

    // y-axis
    g3.append("text")
    .attr("x", -(barHeight / 2))
    .attr("y", -35)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Product Count");

    // title
    g3.append("text")
    .attr("x", barWidth / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text("Product Count by Skin Type");

    // x-axis scale using d3.scaleBand -> used for bar charts as mentioned in the d3js website
    const x2 = d3.scaleBand()
    .domain(skinTypeCounts.map(d => d.skin))
    .range([0, barWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2);
    
    //draw and position x-axis
    const xAxisCall2 = d3.axisBottom(x2);
    g3.append("g")
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
    g3.append("g").call(yAxisCall2);

    // bars
    const bars = g3.selectAll("rect").data(skinTypeCounts);

    // creates one blue block per skin type for the bar chart in relation to the data
    bars.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", d => x2(d.skin))
    .attr("width", x2.bandwidth())
    .attr("height", d => barHeight - y2(d.count))
    .attr("fill", "steelblue");

    /*-----------------------Plot 3: Sankey Diagram-------------------------*/

    // group g4 defined as another svg object for the Sankey Diagram
    const g4 = svg.append("g")
        .attr("transform", `translate(${width - 600}, ${scatterMargin.top})`)
        
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
    g4.append("g")
        .selectAll("rect")
        .data(sankeyLayout.nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#000");
    
    // append to svg g4 and create the links between nodes in the sankey diagram 
    g4.append("g")
        .selectAll("path")
        .data(sankeyLayout.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#aaa")
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("fill", "none")
        .attr("opacity", 0.5);

    // label each node a.k.a. the top ingredients and the skin type
    g4.append("g")
        .selectAll("text")
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
    g4.append("g")
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

    //title for sankey diagram
    g4.append("text")
        .attr("x", 250)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .attr("font-size", "20px")
        .attr("font-weight", "bold")
        .text("Top 10 Ingredients Mapped to Skin Type Suitability");


    }).catch(function(error){
    console.log(error);
});