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

    function preloadImages(projects) {
        const buffer = new Map();
        return Promise.all(projects.map(project => {
            return new Promise(resolve => {
                if (buffer.has(project.img)) {
                    buffer.set(project.name, buffer.get(project.img));
                    resolve();
                    return;
                }
                const img = new Image();
                img.src = project.img;
                img.alt = project.name;
                img.classList.add("project-logo");
                img.onload = () => {
                    buffer.set(project.img, img);
                    buffer.set(project.name, img);
                    resolve();
                };
                img.onerror = () => {
                    buffer.set(project.img, img);
                    buffer.set(project.name, img);
                    resolve();
                };
            });
        })).then(() => buffer);
    }

    function initFlipCard(projectImages) {
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
        const manualBtn = document.getElementById("manualFlipBtn");

        function buildCardContent(container, project) {
            container.innerHTML = "";

            const title = document.createElement("h3");
            title.textContent = project.name;

            const desc = document.createElement("p");
            desc.textContent = project.desc;

            const hint = document.createElement("div");
            hint.className = "flip-overlay-hint";
            hint.textContent = "← drag or use ↻";

            const link = document.createElement("a");
            link.className = "try-btn";
            link.href = project.url;
            link.target = "_blank";
            link.textContent = "Try It";

            const image = projectImages.get(project.name);
            container.appendChild(title);
            container.appendChild(image);
            container.appendChild(hint)
            container.appendChild(desc);
            container.appendChild(link);
        }

        function updateFaces(rotationDeg) {
            const absRotation = Math.abs(rotationDeg);
            const direction = rotationDeg > 0 ? -1 : 1;
            const targetIndex = (current + direction + projects.length) % projects.length;

            cardInner.style.transform = `rotateY(${rotationDeg}deg)`;

            // Only update flippingTo and back face if threshold passed
            if (absRotation > 90 && flippingTo !== (direction === 1 ? "next" : "prev")) {
                buildCardContent(back, projects[targetIndex]);
                flippingTo = direction === 1 ? "next" : "prev";
            } else if (absRotation <= 90) {
                flippingTo = null; // cancel flip intent
            }
        }


        function finishFlip() {
            if (!flippingTo) {
                // Not enough drag to commit flip — reset
                cardInner.style.transition = "transform 0.6s ease-in-out";
                cardInner.style.transform = "rotateY(0deg)";
                setTimeout(() => cardInner.style.transition = "none", 600);
                return;
            }

            current = flippingTo === "next"
                ? (current + 1) % projects.length
                : (current - 1 + projects.length) % projects.length;

            buildCardContent(front, projects[current]);
            buildCardContent(back, projects[(current + 1) % projects.length]);

            cardInner.style.transition = "transform 0.6s ease-in-out";
            cardInner.style.transform = "rotateY(0deg)";
            setTimeout(() => cardInner.style.transition = "none", 600);

            updateDots(current);
            flippingTo = null; // reset state
        }


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
            }, 5000);
        }

        function resetAutoFlipTimer() {
            lastInteractionTime = Date.now();
            cardInner.style.transition = "none";
        }

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

        let ignoreNextMouseUp = false;

        manualBtn.addEventListener("click", () => {
            ignoreNextMouseUp = true;
            resetAutoFlipTimer();

            if (isAutoFlipping) return;

            isAutoFlipping = true;
            const nextIndex = (current + 1) % projects.length;

            buildCardContent(back, projects[nextIndex]);

            // Flip to 180°
            cardInner.style.transition = "transform 0.6s ease-in-out";
            cardInner.style.transform = "rotateY(180deg)";

            // At halfway (300ms), swap front/back content
            setTimeout(() => {
                current = nextIndex;
                buildCardContent(front, projects[current]);
                buildCardContent(back, projects[(current + 1) % projects.length]);
                updateDots(current);
                cardInner.style.transition = "none";
                cardInner.style.transform = "rotateY(0deg)";
                isAutoFlipping = false;
            }, 600);
        });

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
                setTimeout(() => cardInner.style.transition = "none", 2000);
            }
        });

        // -----------------------
        // Touch events for mobile
        // -----------------------

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

        flipCard.addEventListener("touchend", () => {
            if (!isDragging) return;
            isDragging = false;
            if (Math.abs(currentRotation) > 90) {
                finishFlip();
            } else {
                cardInner.style.transition = "transform 2s ease-in-out";
                cardInner.style.transform = "rotateY(0deg)";
                setTimeout(() => cardInner.style.transition = "none", 2000);
            }
        });

        buildCardContent(front, projects[0]);
        buildCardContent(back, projects[1]);
        setupDots();
        startAutoFlip();
    }

    preloadImages(projects).then(projectImages => {
        initFlipCard(projectImages);
    });
});
