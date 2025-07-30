document.addEventListener("DOMContentLoaded", () => {
    const projects = [
        {
            name: "Maze Game",
            url: "https://maze.aedev.pro",
            desc: "A 3D maze runner built in Blazor with WebGL.",
            img: "/assets/logo_header.png"
        },
        {
            name: "CryptoTrade",
            url: "https://crypto.aedev.pro",
            desc: "Simulated crypto trading platform with alert system.",
            img: "/assets/logo_header.png"
        },
        {
            name: "DevQuest",
            url: "https://devquest.aedev.pro",
            desc: "Interactive RPG portfolio with skills and quests.",
            img: "/assets/logo_header.png"
        }
    ];

    let current = 0;
    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;
    let flippingTo = null;
    let isAutoFlipping = false;

    let lastInteractionTime = Date.now();
    let autoFlipInterval;

    const flipCard = document.getElementById("flipCard");
    const cardInner = document.getElementById("cardInner");
    const front = document.getElementById("cardFront");
    const back = document.getElementById("cardBack");
    const dotsContainer = document.getElementById("dotsContainer");

    // Preloaded image elements
    const projectImages = new Map();

    projects.forEach((project) => {
        const img = new Image();
        img.src = project.img;
        img.alt = project.name;
        img.classList.add("project-logo");
        projectImages.set(project.name, img);
    });

    // Build content
    function buildCardContent(container, project) {
        container.innerHTML = ""; // clear previous content

        const title = document.createElement("h3");
        title.textContent = project.name;

        const image = projectImages.get(project.name).cloneNode(true); // use preloaded copy

        const desc = document.createElement("p");
        desc.textContent = project.desc;

        const link = document.createElement("a");
        link.className = "try-btn";
        link.href = project.url;
        link.target = "_blank";
        link.textContent = "Try It";

        container.appendChild(title);
        container.appendChild(image);
        container.appendChild(desc);
        container.appendChild(link);
    }


    // Visual flip update during drag
    function updateFaces(rotationDeg) {
        const absRotation = Math.abs(rotationDeg);
        const direction = rotationDeg > 0 ? -1 : 1;

        if (absRotation > 90) {
            const index = (current + direction + projects.length) % projects.length;
            buildCardContent(back, projects[index]);
            flippingTo = direction === 1 ? "next" : "prev";
        } else {
            buildCardContent(back, projects[(current + 1) % projects.length]);
            flippingTo = null;
        }

        cardInner.style.transform = `rotateY(${rotationDeg}deg)`;
    }

    // Commit flip after drag or touch
    function finishFlip() {
        if (isAutoFlipping) return;

        if (flippingTo === "next") {
            current = (current + 1) % projects.length;
        } else if (flippingTo === "prev") {
            current = (current - 1 + projects.length) % projects.length;
        }

        buildCardContent(front, projects[current]);
        buildCardContent(back, projects[(current + 1) % projects.length]);

        cardInner.style.transition = "transform 2s ease-in-out";
        cardInner.style.transform = "rotateY(0deg)";
        setTimeout(() => {
            cardInner.style.transition = "none";
        }, 2000);

        updateDots(current);
    }

    // Manual project switch
    function showProject(index, direction = 1) {
        current = (index + projects.length) % projects.length;
        buildCardContent(front, projects[current]);
        buildCardContent(back, projects[(current + 1) % projects.length]);

        cardInner.style.transition = "transform 2s ease-in-out";
        cardInner.style.transform = `rotateY(${direction === 1 ? 180 : -180}deg)`;

        setTimeout(() => {
            cardInner.style.transition = "none";
            cardInner.style.transform = "rotateY(0deg)";
            updateDots(current);
        }, 2000);
    }

    // Auto flip behavior
    function startAutoFlip() {
        autoFlipInterval = setInterval(() => {
            if (Date.now() - lastInteractionTime > 3000) {
                isAutoFlipping = true;
                cardInner.style.transition = "transform 2s ease-in-out";
                cardInner.style.transform = "rotateY(180deg)";

                setTimeout(() => {
                    current = (current + 1) % projects.length;
                    buildCardContent(front, projects[current]);
                    buildCardContent(back, projects[(current + 1) % projects.length]);
                    cardInner.style.transition = "none";
                    cardInner.style.transform = "rotateY(0deg)";
                    updateDots(current);
                    isAutoFlipping = false;
                }, 2000);
            }
        }, 5000); // check every 5s
    }

    // Interaction resets
    function resetAutoFlipTimer() {
        lastInteractionTime = Date.now();
        cardInner.style.transition = "none";
    }

    // Setup dots
    function updateDots(index) {
        dotsContainer.querySelectorAll(".flip-dot").forEach((dot, i) => {
            dot.classList.toggle("active", i === index);
        });
    }

    function setupDots() {
        projects.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("flip-dot");
            if (i === 0) dot.classList.add("active");
            dot.addEventListener("click", () => {
                resetAutoFlipTimer();
                if (i !== current) showProject(i, i > current ? 1 : -1);
            });
            dotsContainer.appendChild(dot);
        });
    }

    // Button control
    const manualBtn = document.getElementById("manualFlipBtn");
    const overlayHint = document.querySelector(".flip-overlay-hint");

    let ignoreNextMouseUp = false;

    manualBtn.addEventListener("click", () => {
        ignoreNextMouseUp = true;
        resetAutoFlipTimer();
        showProject(current + 1, 1);
    });


    // Mouse drag
    flipCard.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        cardInner.style.transition = "none";
        resetAutoFlipTimer();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - startX;
        currentRotation = deltaX * 0.2;
        currentRotation = Math.max(Math.min(currentRotation, 180), -180);
        updateFaces(currentRotation);
    });

    document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(currentRotation) > 90) {
            finishFlip();
        } else {
            cardInner.style.transition = "transform 2s ease-in-out";
            cardInner.style.transform = "rotateY(0deg)";
            setTimeout(() => {
                cardInner.style.transition = "none";
            }, 2000);
        }
    });

    // Touch drag
    flipCard.addEventListener("touchstart", (e) => {
        isDragging = true;
        startX = e.touches[0].clientX;
        cardInner.style.transition = "none";
        resetAutoFlipTimer();
    });

    flipCard.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const deltaX = e.touches[0].clientX - startX;
        currentRotation = deltaX * 0.2;
        currentRotation = Math.max(Math.min(currentRotation, 180), -180);
        updateFaces(currentRotation);
    });

    flipCard.addEventListener("touchend", (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (Math.abs(currentRotation) > 90) {
            finishFlip();
        } else {
            cardInner.style.transition = "transform 2s ease-in-out";
            cardInner.style.transform = "rotateY(0deg)";
            setTimeout(() => {
                cardInner.style.transition = "none";
            }, 2000);
        }
    });

    // Init
    buildCardContent(front, projects[0]);
    buildCardContent(back, projects[1]);
    setupDots();
    startAutoFlip();
});
