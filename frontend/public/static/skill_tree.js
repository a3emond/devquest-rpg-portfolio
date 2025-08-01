// AEDev Skill Tree Visualization with Drop Zone Magnet, Animated Zone, and Card System
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("static/full_skill_tree.json");
        if (!response.ok) throw new Error("JSON fetch failed");
        const jsonData = await response.json();
        renderSkillTree("skill-tree", jsonData);
    } catch (err) {
        console.error("❌ Failed to load skill tree JSON:", err);
    }
});

function resolveIcon(iconStr) {
    const fontAwesomeMap = {
        "fa-terminal": "\uf120",
        "fa-server": "\uf233",
        "fa-code": "\uf121",
        "fa-box-open": "\uf49e",
        "fa-cloud": "\uf0c2",
        "fa-layer-group": "\uf5fd",
        "fa-display": "\ue163",
        "fa-globe": "\uf0ac",
        "fa-credit-card": "\uf09d",
        "fa-cubes": "\uf1b3",
        "fa-microchip": "\uf2db",
        "fa-lightbulb": "\uf0eb",
        "fa-brain": "\uf5dc",
        "fa-sitemap": "\uf0e8",
        "fa-users": "\uf0c0",
        "fa-robot": "\uf544",
        "fa-cogs": "\uf085",
        "fa-database": "\uf1c0",
        "fa-chart-line": "\uf201",
        "fa-user": "\uf007"
    };
    const name = iconStr?.split(" ").at(-1);
    return fontAwesomeMap[name] || "\uf128";
}

export function renderSkillTree(containerId, jsonData) {
    const container = d3.select(`#${containerId}`);
    if (container.empty()) return;
    container.selectAll("*").remove();

    const width = container.node().clientWidth;
    const height = container.node().clientHeight;
    const center = { x: width / 2, y: height / 2 };

    const svgBase = container.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("id", "skill-svg")
        .style("background", "transparent")
        .style("border", "2px solid rgba(255,255,255,0.1)")
        .style("border-radius", "12px")
        .style("backdrop-filter", "blur(6px)")
        .style("box-shadow", "0 0 20px rgba(0,255,255,0.15)");

    const svg = svgBase.append("g");

    jsonData.groups.forEach(group => {
        const zone = group.zone || {};
        svg.append("rect")
            .attr("class", "skill-zone")
            .attr("x", zone.x || 0)
            .attr("y", zone.y || 0)
            .attr("width", zone.width || 300)
            .attr("height", zone.height || 300)
            .attr("fill", zone.color || "rgba(255,255,255,0.03)")
            .attr("rx", 30);

        if (zone.icon) {
            svg.append("text")
                .attr("x", (zone.x || 0) + 10)
                .attr("y", (zone.y || 0) + 30)
                .attr("class", "fa")
                .style("font-family", "FontAwesome")
                .style("fill", "#999")
                .text(resolveIcon(zone.icon));
        }
    });

    const nodes = jsonData.skills.map(skill => ({
        ...skill,
        id: skill.id,
        x: center.x + Math.random() * 150 - 75,
        y: center.y + Math.random() * 150 - 75,
        dragPriority: 0
    }));

    const links = [];
    jsonData.skills.forEach(skill => {
        (skill.unlocks || []).forEach(target => {
            links.push({ source: skill.id, target });
        });
    });

    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(center.x, center.y))
        .force("collision", d3.forceCollide().radius(35));

    const link = svg.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(links)
        .join("line");

    const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(drag(simulation));

    node.append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .attr("x", -20)
        .attr("y", -20)
        .attr("rx", 10)
        .attr("ry", 10)
        .attr("fill", "#ffffff")
        .attr("class", "skill-node");

    node.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("font-family", "FontAwesome")
        .attr("font-size", "16px")
        .text(d => resolveIcon(d.icon || ""));

    const card = d3.select("#skill-info-card");
    let currentHeld = null;
    let cardClearTimeout = null;

    const dropX = width / 2;
    const dropY = height / 2;
    const dropRadius = 28;

    const dropZone = svg.append("circle")
        .attr("cx", dropX)
        .attr("cy", dropY)
        .attr("r", dropRadius)
        .attr("fill", "rgba(0,255,255,0.2)")
        .attr("stroke", "cyan")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 6px cyan)")
        .transition()
        .duration(1500)
        .ease(d3.easeSin)
        .attr("r", dropRadius + 4)
        .transition()
        .duration(1500)
        .ease(d3.easeSin)
        .attr("r", dropRadius)
        .on("end", function repeat() {
            d3.select(this).transition().duration(1500).attr("r", dropRadius + 4).transition().duration(1500).attr("r", dropRadius).on("end", repeat);
        });

    svg.append("text")
        .attr("x", dropX)
        .attr("y", dropY - dropRadius - 10)
        .attr("text-anchor", "middle")
        .text("Drop Here")
        .style("fill", "#00ffff")
        .style("font-weight", "bold");

    function updateCard(skill) {
        card.classed("active", true)
            .html(`
                <h3>${skill.label}</h3>
                <p>${skill.description}</p>
                <ul>${(skill.details || []).map(d => `<li>${d}</li>`).join("")}</ul>
            `);

        currentHeld = skill;
        skill.fx = dropX;
        skill.fy = dropY;

        clearTimeout(cardClearTimeout);
        cardClearTimeout = setTimeout(() => {
            ejectSkill(skill);
            currentHeld = null;
            resetCard();
        }, 3000);
    }

    function resetCard() {
        card.classed("active", false)
            .html(`<p class="placeholder-text">➦ Drag a skill node into this card to see details</p>`);
    }

    function ejectSkill(skill) {
        skill.fx = null;
        skill.fy = null;
        const angle = Math.random() * 2 * Math.PI;
        const speed = 150;
        skill.vx = Math.cos(angle) * speed;
        skill.vy = Math.sin(angle) * speed;
    }

    simulation.on("tick", () => {
        nodes.forEach(d => {
            d.x = Math.max(30, Math.min(width - 30, d.x));
            d.y = Math.max(30, Math.min(height - 30, d.y));

            const dist = Math.sqrt((d.x - dropX) ** 2 + (d.y - dropY) ** 2);

            if (currentHeld && currentHeld.id === d.id) {
                d.fx = dropX;
                d.fy = dropY;
            }

            if (dist < dropRadius && d.dragPriority > 0) {
                if (!currentHeld || currentHeld.id !== d.id) {
                    if (currentHeld && currentHeld.id !== d.id) {
                        ejectSkill(currentHeld);
                    }
                    updateCard(d);
                }
            }
        });

        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    d3.timer((elapsed) => {
        const padding = 50;
        const amp = 20;
        const freq = 0.3;

        nodes.forEach((d, i) => {
            const t = (elapsed + i * 100) * 0.001;
            const swimX = Math.cos(t * freq) * amp;
            const swimY = Math.sin(t * freq) * amp;

            const centerBiasX = (width / 2 - d.x) / width;  // ranges -0.5 to 0.5
            const centerBiasY = (height / 2 - d.y) / height;

            // Position-aware nudge + softened oscillation
            d.vx += swimX * 0.01 + centerBiasX * 0.2;
            d.vy += swimY * 0.01 + centerBiasY * 0.2;

            // Bounce near walls
            if (d.x < padding) d.vx += 1;
            if (d.x > width - padding) d.vx -= 1;
            if (d.y < padding) d.vy += 1;
            if (d.y > height - padding) d.vy -= 1;
        });

        simulation.alpha(0.1).restart();
    });


    function drag(simulation) {
        return d3.drag()
            .on("start", (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
                d.dragPriority = 5;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
                setTimeout(() => d.dragPriority = 0, 2500);
            });
    }
}
