document.addEventListener("DOMContentLoaded", () => {
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu"); // .dropdown-menu
    const header = document.querySelector(".sticky-header");
    const faders = document.querySelectorAll(".fade-in");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".dropdown-menu a");
    const snapContainer = document.querySelector(".snap-container");

    // === 1. Toggle hamburger menu ===
    hamburger.addEventListener("click", () => {
        menu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });

    // === 2. Close menu when clicking a nav link ===
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            menu.classList.remove("active");
            hamburger.classList.remove("open");
        });
    });

    // === 2.5 Close menu when clicking outside ===
    document.addEventListener("click", (event) => {
        if (!menu.contains(event.target) && !hamburger.contains(event.target)) {
            menu.classList.remove("active");
            hamburger.classList.remove("open");
        }
    });

    // === 3. Fade-in animations ===
    const appearOptions = {
        root: snapContainer,
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
        });
    }, appearOptions);

    faders.forEach(el => appearOnScroll.observe(el));

    // === 4. Scrollspy + Header shadow + Auto-hide logic together ===
    let lastScrollTop = 0;
    let scrollTimeout;

    function updateScrollState() {
        const scrollY = snapContainer.scrollTop;
        const footer = document.querySelector(".site-footer");
        let current = "";

        // Scrollspy
        sections.forEach(section => {
            const offset = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollY >= offset - height / 2) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });

        // Header shadow toggle
        if (scrollY > 20) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

        // Immediately hide on scroll
        header.style.transform = "translateY(-100%)";
        footer.style.transform = "translateY(100%)";

        // Clear and restart timeout for showing after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            header.style.transform = "translateY(0)";
            footer.style.transform = "translateY(0)";
        }, 100);

        lastScrollTop = scrollY;
    }



    snapContainer.addEventListener("scroll", updateScrollState);
    updateScrollState(); // Run on load to highlight Home

    // === 5. ESC key closes menu ===
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            menu.classList.remove("active");
            hamburger.classList.remove("open");
        }
    });

    const scrollDownBtn = document.getElementById("scrollDownBtn");

    // Scroll to next section
    scrollDownBtn.addEventListener("click", () => {
        const scrollY = snapContainer.scrollTop;
        const nextSection = Array.from(sections).find(section => section.offsetTop > scrollY + 10);
        if (nextSection) {
            snapContainer.scrollTo({
                top: nextSection.offsetTop,
                behavior: "smooth"
            });
        }
    });

    // Show/hide arrow based on scroll position
    snapContainer.addEventListener("scroll", () => {
        const currentScroll = snapContainer.scrollTop;
        const maxScroll = snapContainer.scrollHeight - snapContainer.clientHeight;

        if (currentScroll >= maxScroll - 10) {
            scrollDownBtn.classList.add("hidden");
        } else {
            scrollDownBtn.classList.remove("hidden");
        }
    });

});
