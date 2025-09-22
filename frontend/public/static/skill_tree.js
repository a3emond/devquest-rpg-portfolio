// AEDev Skill Tree Visualization with Drop Zone Magnet, Animated Zone, and Card System

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { getCurrentLang, onLangChange } from './lang.js';

let currentData = null;
let currentLang = getCurrentLang();

// color dictionary
let colors = {
    black : "#000000",
    white : "#ffffff",
    green : "#3CCA8F"
}


window.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("static/full_skill_tree.json");
        if (!response.ok) throw new Error("JSON fetch failed");
        currentData = await response.json();
        renderSkillTree("skill-tree", currentData, currentLang);
    } catch (err) {
        console.error(" Failed to load skill tree JSON:", err);
    }
});

// Re-render when language changes
onLangChange((newLang) => {
    currentLang = newLang;
    if (currentData) {
        renderSkillTree("skill-tree", currentData, currentLang);
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
        "fa-user": "\uf007",
        "fa-code-branch": "\uf126",
        "fa-keyboard": "\uf11c",
        "fa-network-wired": "\uf6ff",
        "fa-shield-halved": "\ue00c",
        "fa-people-group": "\ue533"
    };
    const name = iconStr?.split(" ").at(-1);
    return fontAwesomeMap[name] || "\uf128"; // fallback = question mark
}

export function renderSkillTree(containerId, jsonData, lang = "en") {
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
        .style("background", "rgba(0, 0, 0, 0.45)")
        .style("border", "2px solid #a17f1a")
        .style("border-radius", "12px")
        .style("backdrop-filter", "blur(6px)")
        .style("box-shadow", "0 0 20px rgba(0,255,255,0.15)");

    const svg = svgBase.append("g");

    // Drop zone coordinates and radius
    const dropX = width / 2;
    const dropY = height / 2;
    const dropRadius = 28;

    // Draw drop zone (under everything else)
    const dropZone = svg.append("circle")
        .attr("cx", dropX)
        .attr("cy", dropY)
        .attr("r", dropRadius)
        .attr("fill", "#222")
        .attr("stroke", "#88deba")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0 0 6px #88deba)")
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

    const dropText = {
        en : "Drop Here",
        fr : "Déposez Ici"
    }
    svg.append("text")
        .attr("x", dropX)
        .attr("y", dropY - dropRadius - 10)
        .attr("text-anchor", "middle")
        .text(dropText[lang] || dropText.en)
        .style("fill", "#3CCA8F")
        .style("font-weight", "bold");

    // Title (above drop zone, but still under nodes/links)
    const TitleText = {
        en: "Skills",
        fr: "Compétences"
    };

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 54)
        .attr("text-anchor", "middle")
        .attr("font-size", "44px")
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .attr("fill", "#000000")
        .attr("opacity", 0.33)
        .attr("pointer-events", "none")
        .text(TitleText[lang] || TitleText.en);

    // Prepare nodes and links
    const nodes = jsonData.skills.map(skill => ({
        ...skill,
        id: skill.id,
        x: center.x + Math.random() * 150 - 75,
        y: center.y + Math.random() * 150 - 75,
        dragPriority: 0
    }));

// === Build links between nodes in same group ===
    const links = [];
    for (let i = 0; i < jsonData.skills.length; i++) {
        for (let j = i + 1; j < jsonData.skills.length; j++) {
            const skillA = jsonData.skills[i];
            const skillB = jsonData.skills[j];
            if (skillA.groupId && skillA.groupId === skillB.groupId) {
                links.push({ source: skillA.id, target: skillB.id, internal: true });
            }
        }
    }


    const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-250))
        .force("center", d3.forceCenter(center.x, center.y))
        .force("collision", d3.forceCollide().radius(35));

    // Draw links (above drop zone)
    const link = svg.append("g")
        .attr("stroke", colors.green)
        .attr("stroke-width", 1.5)
        .selectAll("line")
        .data(links)
        .join("line");

    // Draw nodes (above links and drop zone)
    const node = svg.append("g")
        .attr("stroke", colors.green)
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

    // Tooltip
    const tooltipGroup = svg.append("g")
        .attr("pointer-events", "none")
        .style("display", "none");

    const tooltipRect = tooltipGroup.append("rect")
        .attr("fill", "#222")
        .attr("rx", 6)
        .attr("ry", 6)
        .attr("opacity", 0.9);

    const tooltipText = tooltipGroup.append("text")
        .attr("fill", "#fff")
        .attr("font-size", "14px")
        .attr("x", 8)
        .attr("y", 20);

    node.on("mouseover", (event, d) => {
        tooltipText.text(d.label?.[lang] || d.label?.en || "No label");
        const textBBox = tooltipText.node().getBBox();
        const tooltipWidth = textBBox.width + 16;
        const tooltipHeight = textBBox.height + 16;
        tooltipRect
            .attr("width", tooltipWidth)
            .attr("height", tooltipHeight)
            .attr("x", 0)
            .attr("y", 0);
        tooltipText
            .attr("x", 8)
            .attr("y", tooltipHeight / 2 + textBBox.height / 4);
        tooltipGroup.style("display", null);
    })
        .on("mousemove", (event) => {
            const [mouseX, mouseY] = d3.pointer(event, svg.node());
            const svgWidth = +svgBase.attr("width");
            const svgHeight = +svgBase.attr("height");
            const tooltipWidth = +tooltipRect.attr("width");
            const tooltipHeight = +tooltipRect.attr("height");
            let x = mouseX + 18;
            let y = mouseY - 10;
            if (x + tooltipWidth > svgWidth) x = svgWidth - tooltipWidth - 2;
            if (y + tooltipHeight > svgHeight) y = svgHeight - tooltipHeight - 2;
            if (x < 0) x = 2;
            if (y < 0) y = 2;
            tooltipGroup.attr("transform", `translate(${x},${y})`);
        })
        .on("mouseout", () => {
            tooltipGroup.style("display", "none");
        });

    const card = d3.select("#skill-info-card");
    let currentHeld = null;
    let cardClearTimeout = null;

    function updateCard(skill) {
        card.classed("active", true)
            .html(`
            <button class="close-skill-card" aria-label="Close">✕</button>
            <h3>${skill.label?.[lang] || skill.label?.en}</h3>
            <p>${skill.description?.[lang] || skill.description?.en}</p>
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

        card.select(".close-skill-card").on("click", () => {
            ejectSkill(skill);
            currentHeld = null;
            resetCard();
        });
    }

    function resetCard() {
        card.classed("active", false)
            .html(`<p class="placeholder-text">➦ Drag a skill node into the drop zone to see details</p>`); // legacy text injection
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
            const centerBiasX = (width / 2 - d.x) / width;
            const centerBiasY = (height / 2 - d.y) / height;
            d.vx += swimX * 0.01 + centerBiasX * 0.2;
            d.vy += swimY * 0.01 + centerBiasY * 0.2;
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