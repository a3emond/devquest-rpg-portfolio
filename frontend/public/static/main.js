// static/main.js
import { toggleLang, getCurrentLang, onLangChange } from './lang.js';

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById('langToggleBtn');
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");
    const header = document.querySelector(".sticky-header");
    const footer = document.querySelector(".site-footer");
    const faders = document.querySelectorAll(".fade-in");
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".dropdown-menu a");
    const snapContainer = document.querySelector(".snap-container");
    const scrollDownBtn = document.getElementById("scrollDownBtn");
    const scrollUpBtn = document.getElementById("scrollUpBtn");

    // === Language Toggle ===
    if (btn) {
        // Set initial label and apply listener
        onLangChange((lang) => {
            btn.innerText = lang.toUpperCase();
        });

        btn.addEventListener('click', () => {
            toggleLang();
        });
    }

    // === 1. Toggle hamburger menu ===
    hamburger?.addEventListener("click", () => {
        menu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });

    // === 2. Close menu on nav link click ===
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
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(el => appearOnScroll.observe(el));

    // === 4. Scrollspy, header/footer visibility, section highlight ===
    let scrollTimeout;

    function updateScrollState() {
        const scrollY = snapContainer.scrollTop;
        let current = "";

        // Active section
        sections.forEach(section => {
            const offset = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollY >= offset - height / 2) {
                current = section.getAttribute("id");
            }
        });

        // Nav highlight
        navLinks.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
        });

        // Header shadow
        header.classList.toggle("scrolled", scrollY > 20);

        // Immediate hide header/footer
        header.style.transform = "translateY(-100%)";
        footer.style.transform = "translateY(100%)";

        // Re-show after delay
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            header.style.transform = "translateY(0)";
            footer.style.transform = "translateY(0)";
        }, 100);
    }

    snapContainer.addEventListener("scroll", () => {
        updateScrollState();

        const scrollY = snapContainer.scrollTop;
        const maxScroll = snapContainer.scrollHeight - snapContainer.clientHeight;

        // Show/hide scroll down button
        scrollDownBtn?.classList.toggle("hidden", scrollY >= maxScroll - 10);

        // Show/hide scroll up button
        scrollUpBtn?.classList.toggle("hidden", scrollY <= 300);
    });

    // Initial scroll state
    updateScrollState();

    // === 5. ESC closes menu ===
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            menu.classList.remove("active");
            hamburger.classList.remove("open");
        }
    });

    // === 6. Scroll Down Button ===
    scrollDownBtn?.addEventListener("click", () => {
        const scrollY = snapContainer.scrollTop;
        const nextSection = Array.from(sections).find(section => section.offsetTop > scrollY + 10);
        if (nextSection) {
            snapContainer.scrollTo({ top: nextSection.offsetTop, behavior: "smooth" });
        }
    });

    // === 7. Scroll Up Button ===
    scrollUpBtn?.addEventListener("click", () => {
        const scrollY = snapContainer.scrollTop;
        const prevSection = Array.from(sections).reverse().find(section => section.offsetTop < scrollY - 10);
        if (prevSection) {
            snapContainer.scrollTo({ top: prevSection.offsetTop, behavior: "smooth" });
        }
    });
});
