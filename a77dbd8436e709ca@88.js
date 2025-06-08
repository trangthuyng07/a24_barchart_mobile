function _1(md){return(
md`# Untitled`
)}

function _chart($0)
{
  return $0;
}


function _gallery(html,d3,cleanData)
{
   const container = html`<div style="padding: 20px; font-family: 'Inter', sans-serif; width: 100%; max-width: 400px; height: 600px;"></div>`;

    const maxFilms = d3.max(cleanData, d => d.count_of_id);
    const maxVotes = d3.max(cleanData, d => d.sum_vote_count);

    const topSection = html`<div style="display: flex; flex-direction: column; align-items: left; gap: 24px; margin-bottom: 60px;"></div>`;
    container.appendChild(topSection);

    const select = html`<select style="font-size: 12px; padding: 10px; border: 1px solid #e53e3e; border-radius: 6px; background: white;">
        <option value="count_of_id" selected>🎬 Top 20 Prolific Directors</option>
        <option value="sum_vote_count">👍 Top 20 Most Voted Directors</option>
        <option value="">🔽 View: All Directors Grid</option>
    </select>`;
    topSection.appendChild(select);

    const chartBox = html`<div style="
        width: 100%;
        max-width: 400px;
        height: 500px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
    "></div>`;
    topSection.appendChild(chartBox);

    const grid = html`<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; justify-content: center; align-items: stretch; max-width: 600px; margin: 0 auto; padding: 30px 20px; max-height: 500px; overflow-y: auto;"></div>`;
    container.appendChild(grid);

    const sorted = [...cleanData].sort((a, b) => d3.descending(a.count_of_id, b.count_of_id));
    sorted.forEach(d => {
        const card = html`<div style="background: #000; border-radius: 12px; padding: 10px; width: 90%; text-align: center; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center;"
            onmouseover="${() => card.style.transform = 'scale(1.03)'}"
            onmouseout="${() => card.style.transform = 'scale(1)'}">
            <img src="${d.director_image}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 50%; border: ${d.count_of_id === maxFilms ? '3px solid gold' : 'none'}; box-shadow: ${d.sum_vote_count === maxVotes ? '0 0 10px 4px rgba(0,123,255,0.4)' : 'none'}; margin-bottom: 8px;" />
            <strong style="font-size: 10px; color: white;">${d.director}${d.count_of_id === maxFilms ? '👑' : ''}${d.sum_vote_count === maxVotes ? '🔥' : ''}</strong>
            <small style="font-size: 10px; color: white;">🎬 ${d.count_of_id} film(s)<br/>👍 ${d.sum_vote_count} votes</small>
        </div>`;
        grid.appendChild(card);
    });

    select.onchange = () => {
        chartBox.innerHTML = "";
        if (!select.value) {
            chartBox.style.display = "none";
            grid.style.display = "grid";
            return;
        }

        grid.style.display = "none";
        chartBox.style.display = "flex";

        const top20 = [...cleanData].sort((a, b) => d3.descending(a[select.value], b[select.value])).slice(0, 20);
        const width = 500, height = 500;
        const margin = { top: 5, right: 30, bottom: 20, left: 173};

        const svg = d3.create("svg").attr("width", width).attr("height", height);

        const x = d3.scaleLinear()
            .domain([0, d3.max(top20, d => d[select.value])])
            .range([margin.left + 40, width - margin.right]);

        const y = d3.scaleBand()
            .domain(top20.map(d => d.director))
            .range([margin.top, height - margin.bottom])
            .padding(0.25);

        svg.on("click", () => {
            const shuffled = d3.shuffle(top20);
            y.domain(shuffled.map(d => d.director));
            svg.selectAll("rect").data(shuffled, d => d.director)
                .transition().duration(800).attr("y", d => y(d.director));
            svg.selectAll("text.name-label").data(shuffled, d => d.director)
                .transition().duration(800).attr("y", d => y(d.director) + y.bandwidth() / 2 + 4);
        });

        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(5, "~s"))
            .selectAll("text")
            .style("font-family", "Inter");

        svg.append("g")
            .selectAll("rect")
            .data(top20, d => d.director)
            .join(
                enter => enter.append("rect")
                    .attr("x", x(0))
                    .attr("y", d => y(d.director))
                    .attr("width", 0)
                    .attr("height", y.bandwidth())
                    .attr("fill", "#000")
                    .call(enter => enter.transition().duration(800).attr("width", d => x(d[select.value]) - x(0) + 30)),
                update => update.transition().duration(800)
                    .attr("y", d => y(d.director))
                    .attr("width", d => x(d[select.value]) - x(0) + 30),
                exit => exit.transition().duration(400).attr("width", 0).remove()
            );

        const tooltip = html`<div style="position: absolute; pointer-events: none; background: white; border: 1px solid #ccc; padding: 6px 10px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); font-size: 12px; display: none; z-index: 10; font-family: 'Inter'; max-width: 220px; min-width: 160px;"></div>`;
        chartBox.appendChild(tooltip);

        svg.append("g")
            .selectAll("text.name-label")
            .data(top20, d => d.director)
            .join(
                enter => enter.append("text")
                    .attr("class", "name-label")
                    .attr("x", margin.left - 4)
                    .attr("y", d => y(d.director) + y.bandwidth() / 2 + 4)
                    .text(d => d.director)
                    .attr("text-anchor", "end")
                    .style("font-size", "10px")
                    .style("font-family", "Inter")
                    .style("font-weight", "500")
                    .style("cursor", "pointer")
                    .on("mouseover", (event, d) => {
                        tooltip.innerHTML = `
                            <div style="text-align:center;">
                                <img src="${d.director_image}" style="width:52px;height:52px;border-radius:50%;object-fit:cover;margin-bottom:4px" />
                                <div style="font-weight:600;">${d.director}</div>
                                <div style="font-size:10px;">🎬 ${d.count_of_id} | 👍 ${d.sum_vote_count}</div>
                            </div>`;
                        tooltip.style.display = "block";
                    })
                    .on("mousemove", event => {
                        const tooltipWidth = tooltip.offsetWidth;
                        const tooltipHeight = tooltip.offsetHeight;
                        const padding = 10;
                        const bounds = chartBox.getBoundingClientRect();
                        const mouseX = event.clientX - bounds.left;
                        const mouseY = event.clientY - bounds.top;
                        tooltip.style.left = `${(mouseX + tooltipWidth + padding > bounds.width) ? (mouseX - tooltipWidth - padding) : (mouseX + padding)}px`;
                        tooltip.style.top = `${(mouseY + tooltipHeight + padding > bounds.height) ? (mouseY - tooltipHeight - padding) : (mouseY + padding)}px`;
                    })
                    .on("mouseout", () => tooltip.style.display = "none"),
                update => update.transition().duration(800)
                    .attr("y", d => y(d.director) + y.bandwidth() / 2 + 4)
            );

        chartBox.appendChild(svg.node());
    };

    select.onchange();
    return container;
}





function _cleanData(data){return(
data.filter(d =>
  typeof d.sum_vote_count === "number" &&
  d.sum_vote_count > 0 &&
  d.director_image &&
  d.director_image.startsWith("http")
)
)}

function _5(data){return(
data.map(d => ({
  name: d.director,
  vote: d.sum_vote_count,
  image: d.director_image
}))
)}

function _data(FileAttachment){return(
FileAttachment("A24_Directors_With_Image.csv").csv({typed: true})
)}

function _a24_directors_with_image(__query,FileAttachment,invalidation){return(
__query(FileAttachment("A24_Directors_With_Image.csv"),{from:{table:"A24_Directors_With_Image"},sort:[],slice:{to:null,from:null},filter:[],select:{columns:null}},invalidation)
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["A24_Directors_With_Image.csv", {url: new URL("./files/664087b7e0e0a81eae5637dad0aa3bd5414a326cba5b94eb3c10c8f75059bafb4744b83d02c21069ee934fd50597f62d59c759000d50bfc7da0e6c690709c954.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["viewof gallery"], _chart);
  main.variable(observer("viewof gallery")).define("viewof gallery", ["html","d3","cleanData"], _gallery);
  main.variable(observer("gallery")).define("gallery", ["Generators", "viewof gallery"], (G, _) => G.input(_));
  main.variable(observer("cleanData")).define("cleanData", ["data"], _cleanData);
  main.variable(observer()).define(["data"], _5);
  main.variable(observer("data")).define("data", ["FileAttachment"], _data);
  main.variable(observer("a24_directors_with_image")).define("a24_directors_with_image", ["__query","FileAttachment","invalidation"], _a24_directors_with_image);
  return main;
}
