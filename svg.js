// parse data
const csv = document.getElementsByTagName("pre")[0].innerHTML;
const csvData = d3.csvParse(csv);
const groups = csvData.map(it => getGroup(it));
const subgroups = csvData.columns.slice(1);
const yMax = findMax(csvData);

// formatting constants
const width = 640;
const height = 480;
const margin = {top: 50, bottom: 50, left: 50, right: 50};
const colors = getColors(subgroups);

// append svg to body
const svg = d3.select("#barchart")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

// X-axis content
const x = d3.scaleBand()
    .domain(groups)
    .range([0, width])
    .padding(0.2);

// X-axis subgroup content
const xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding(0.05);

// Y-axis content
const y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

// draw X-axis
svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(0));

// draw Y-axis
svg.append("g")
    .call(d3.axisLeft(y));

// draw grouped bars
svg.append("g")
    .selectAll("g")
    .data(csvData)
    .join("g")
        .attr("transform", it => `translate(${ x(getGroup(it)) }, 0)`)
    .selectAll("rect")
    .data(it => subgroups.map(key => {
        return {key: key, value: it[key]};
    }))
    .join("g")
        .attr("class", "bar")
        .append("rect")
            .attr("x", it => xSubgroup(it.key))
            .attr("y", it => y(it.value))
            .attr("width", xSubgroup.bandwidth())
            .attr("height", it => height - y(it.value))
            .attr("fill", it => colors(it.key));

// add legend
const radius = 6;
const legend = d3.select("#legend")
    .append("svg")
        .attr("class", "legend");

for(let i = 0; i < subgroups.length; i++) {
    d3.select(".legend")
        .append("circle")
            .attr("cx", 50)
            .attr("cy", 25 + i * 25)
            .attr("r", radius)
            .attr("fill", it => colors(subgroups[i]));

    d3.select(".legend")
        .append("text")
            .attr("x", 50 + 15)
            .attr("y", 25 + i * 25 + radius / 2)
            .attr("fill", "black")
            .attr("font-family", "Arial")
            .text(subgroups[i]);
}

/** HELPER FUNCTIONS */

function getGroup(obj) {
    return obj[Object.keys(obj)[0]];
}

/** Returns an array of N random colors, where N is the number of groups. */
function getColors(groupings) {
    let colors = [];
    
    for(let i = 0; i < groupings.length; i++) {
        let value = Math.floor(Math.random() * 0xFFFFFF).toString(16);
        if(value.length != 6) value = value.padStart(6, "0");
        colors.push(`#${value}`);
    }
    
    return d3.scaleOrdinal().domain(groupings).range(colors);
}

/** Finds the object with the maximum value in an array. */
function findMax(array) {
    let maximum = NaN;

    array.forEach(it => {
        Object.keys(it).forEach(key => {
            let value = Number(it[key]);

            if(!isNaN(value)) {
                if(isNaN(maximum) || maximum < value) {
                    maximum = value;
                }
            }
        });
    });

    return maximum;
}
