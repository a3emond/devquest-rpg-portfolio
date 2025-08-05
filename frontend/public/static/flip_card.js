import { toggleLang, getCurrentLang, applyTranslations } from './lang.js';


document.addEventListener("DOMContentLoaded", () => {

    const projects = [
        {
            id: "maze",
            url: "https://maze.aedev.pro",
            img: "/assets/logo_header.png",
            name: {
                en: "Maze Game",
                fr: "Jeu du Labyrinthe"
            },
            desc: {
                en: "A 3D maze runner built in Blazor with WebGL.",
                fr: "Un labyrinthe 3D construit avec Blazor et WebGL."
            }
        },
        {
            id: "crypto",
            url: "https://crypto.aedev.pro",
            img: "/assets/logo_header.png",
            name: {
                en: "CryptoTrade",
                fr: "CryptoTrade"
            },
            desc: {
                en: "Simulated crypto trading platform with alert system.",
                fr: "Plateforme de trading crypto simulée avec alertes."
            }
        },
        {
            id: "devquest",
            url: "https://devquest.aedev.pro",
            img: "/assets/logo_header.png",
            name: {
                en: "DevQuest",
                fr: "DevQuest"
            },
            desc: {
                en: "Interactive RPG portfolio with skills and quests.",
                fr: "Portfolio interactif façon RPG avec compétences et quêtes."
            }
        }
    ];



    function preloadImages(projects) {
        const buffer = new Map();
        return Promise.all(projects.map(project => {
            return new Promise((resolve) => {
                if (buffer.has(project.img)) {
                    buffer.set(project.id, buffer.get(project.img));
                    resolve();
                    return;
                }
                const img = new Image();
                img.src = project.img;
                img.alt = project.name.en;
                img.classList.add("project-logo");
                img.onload = () => {
                    buffer.set(project.img, img);
                    buffer.set(project.id, img);
                    resolve();
                };
                img.onerror = () => {
                    buffer.set(project.img, img);
                    buffer.set(project.id, img);
                    resolve();
                };
            });
        })).then(() => buffer);

    }


    preloadImages(projects).then(projectImages => {
        initFlipCard(projects, projectImages);
        window.addEventListener("langChanged", () => {
            document.getElementById("cardFront").innerHTML = "";
            document.getElementById("cardBack").innerHTML = "";
            buildCardContent(front, projects[current]);
            buildCardContent(back, projects[(current + 1) % projects.length]);
        });

    });

    function initFlipCard(projects, projectImages) {
        let current = 0;
        let isDragging = false;
        let startX = 0;
        let currentRotation = 0;
        let flippingTo = null;
        let isAutoFlipping = false;
        let lastInteractionTime = Date.now();
        let autoFlipInterval;
        let swipeStartTime = 0;

        const flipCard = document.getElementById("flipCard");
        const cardInner = document.getElementById("cardInner");
        const front = document.getElementById("cardFront");
        const back = document.getElementById("cardBack");
        const dotsContainer = document.getElementById("dotsContainer");
        const manualBtn = document.getElementById("manualFlipBtn");

        function buildCardContent(container, project) {
            const lang = getCurrentLang();
            container.innerHTML = "";

            const title = document.createElement("h3");
            title.textContent = project.name[lang] || project.name.en;

            const desc = document.createElement("p");
            desc.textContent = project.desc[lang] || project.desc.en;

            const hint = document.createElement("div");
            hint.className = "flip-overlay-hint";
            hint.textContent = lang === "fr" ? "← glissez ou cliquez ↻" : "← drag or use ↻";

            const link = document.createElement("a");
            link.className = "try-btn";
            link.href = project.url;
            link.target = "_blank";
            link.textContent = lang === "fr" ? "Essayer" : "Try It";

            const image = projectImages.get(project.id);
            container.appendChild(title);
            container.appendChild(image);
            container.appendChild(hint);
            container.appendChild(desc);
            container.appendChild(link);
        }


        function updateFaces(rotationDeg) {
            const absRotation = Math.abs(rotationDeg);
            const direction = rotationDeg > 0 ? -1 : 1;
            const targetIndex = (current + direction + projects.length) % projects.length;

            cardInner.style.transform = `rotateY(${rotationDeg}deg)`;

            if (absRotation > 90 && flippingTo !== (direction === 1 ? "next" : "prev")) {
                buildCardContent(back, projects[targetIndex]);
                flippingTo = direction === 1 ? "next" : "prev";
            } else if (absRotation <= 90) {
                flippingTo = null;
            }
        }

        function finishFlip() {
            if (!flippingTo) {
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
            flippingTo = null;
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

        manualBtn.addEventListener("click", () => {
            resetAutoFlipTimer();
            if (isAutoFlipping) return;

            isAutoFlipping = true;
            const nextIndex = (current + 1) % projects.length;

            buildCardContent(back, projects[nextIndex]);

            cardInner.style.transition = "transform 0.6s ease-in-out";
            cardInner.style.transform = "rotateY(180deg)";

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

        // -------------------------------
        // Mouse-based drag interaction
        // -------------------------------
        let dragStartX = 0;
        let dragDeltaX = 0;
        let dragging = false;

        function clearDrag() {
            dragging = false;
            dragStartX = 0;
            dragDeltaX = 0;
        }

// Start drag anywhere inside the section
        const flipArea = document.querySelector(".flip-carousel");
        flipArea.addEventListener("mousedown", (e) => {
            dragging = true;
            dragStartX = e.clientX;
            dragDeltaX = 0;
            cardInner.style.transition = "none";
            resetAutoFlipTimer();
        });

// Track horizontal drag (global)
        document.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            dragDeltaX = e.clientX - dragStartX;
            currentRotation = dragDeltaX * 0.2;
            currentRotation = Math.max(Math.min(currentRotation, 180), -180);
            updateFaces(currentRotation);
        });

// On mouse up: decide to flip or reset
        document.addEventListener("mouseup", () => {
            if (!dragging) return;
            dragging = false;

            const fastSwipe = Math.abs(dragDeltaX) > 60;
            if (fastSwipe) {
                finishFlip();
            } else {
                cardInner.style.transition = "transform 0.6s ease-in-out";
                cardInner.style.transform = "rotateY(0deg)";
                setTimeout(() => cardInner.style.transition = "none", 600);
            }

            clearDrag();
        });


        // -------------------------------
        // Touch-based drag interaction
        // -------------------------------

        flipCard.addEventListener("touchstart", (e) => {
            isDragging = true;
            startX = e.touches[0].clientX;
            swipeStartTime = Date.now();
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
            const swipeDuration = Date.now() - swipeStartTime;
            const velocity = Math.abs(currentRotation) / swipeDuration;
            const farEnough = Math.abs(currentRotation) > 90;
            const fastSwipe = velocity > 0.5;

            if (fastSwipe || farEnough) {
                finishFlip();
            } else {
                cardInner.style.transition = "transform 0.6s ease-in-out";
                cardInner.style.transform = "rotateY(0deg)";
                setTimeout(() => cardInner.style.transition = "none", 600);
            }
        });

        buildCardContent(front, projects[0]);
        buildCardContent(back, projects[1]);
        setupDots();
        startAutoFlip();
    }
});
