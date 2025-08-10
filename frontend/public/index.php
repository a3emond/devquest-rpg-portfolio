<?php
require __DIR__ . '/../vendor/autoload.php';

?>



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>AEDev – Alexandre Émond</title>

    <link rel="stylesheet" href="static/style.css" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" integrity="sha512-..." crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="icon" href="assets/favicon.ico" />
</head>
<body>

<header class="sticky-header">
    <div class="nav-container">
        <a href="#home"><img src="assets/logo_header.png" alt="AEDev Logo" class="logo" /></a>
        <div class="header-social-icons">
            <a href="https://github.com/a3emond" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
            <a href="https://www.linkedin.com/in/a-emond/" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            <a href="mailto:admin@aedev.pro" aria-label="Email"><i class="fas fa-envelope"></i></a>
        </div>
        <div class="lang-toggle">
            <button id="langToggleBtn" aria-label="Toggle Language">EN/FR</button>
        </div>
        <div class="hamburger" id="hamburger">
            <div></div><div></div><div></div>
        </div>
    </div>
</header>

<nav class="dropdown-menu" id="menu">
    <a href="#home" data-i18n="nav.home">Home</a>
    <a href="#about" data-i18n="nav.about">About</a>
    <a href="#skills" data-i18n="nav.skills">Skills</a>
    <a href="#projects" data-i18n="nav.projects">Projects</a>
    <a href="#contact" data-i18n="nav.contact">Contact</a>
</nav>
<main class="snap-container">
    <section id="home" class="section narrow snap-child">
        <div class="section-inner">
            <div class="section-content">
                <h1 data-i18n="sections.home.title">AEDev</h1>
                <p class="fade-in" data-i18n="sections.home.subtitle">Developer. Designer. Maker.</p>
            </div>
        </div>
    </section>

    <section id="about" class="section narrow snap-child">
        <div class="section-inner">
            <div class="about-grid">
                <div class="about-text">
                    <h2 data-i18n="sections.about.title">About Me</h2>

                    <ul class="about-bullets">
                        <li data-i18n="sections.about.point1"></li>
                        <li data-i18n="sections.about.point2"></li>
                        <li data-i18n="sections.about.point3"></li>
                        <li data-i18n="sections.about.point4"></li>
                    </ul>

                    <div class="about-buttons">
                        <a href="https://cv.aedev.pro" class="btn" target="_blank" data-i18n="sections.about.cvBtn"></a>
                        <a href="#contact" class="btn outline" data-i18n="sections.about.contactBtn"></a>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <section id="skills" class="section narrow snap-child">
        <div class="section-inner skill-section">
            <div class="section-content">
                <div class="skill-tree-wrapper">
                    <div id="skill-tree"></div>
                    <div id="skill-info-card" class="skill-info-card"></div>
                </div>
            </div>
        </div>
    </section>

    <section id="projects" class="section narrow snap-child">
        <div class="section-inner">
            <div class="section-content">
                <h2 data-i18n="sections.projects.title">Projects</h2>
                <div class="flip-carousel">
                    <div class="flip-card" id="flipCard">
                        <div class="flip-card-inner" id="cardInner">
                            <div class="flip-card-front" id="cardFront"></div>
                            <div class="flip-card-back" id="cardBack"></div>
                        </div>
                        <button class="flip-hint-btn" id="manualFlipBtn">↻</button>
                    </div>
                    <div class="carousel-controls">
                        <div class="flip-dots" id="dotsContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="contact" class="section narrow snap-child">
        <div class="section-inner">
            <div class="section-content">
                <h2 data-i18n="sections.contact.title">Contact Me</h2>
                <form action="contact.php" method="POST">
                    <input type="text" name="name" data-i18n-placeholder="sections.contact.form.name" placeholder="Your Name" required />
                    <input type="email" name="email" data-i18n-placeholder="sections.contact.form.email" placeholder="Your Email" required />
                    <textarea name="message" data-i18n-placeholder="sections.contact.form.message" placeholder="Your Message" rows="6" required></textarea>
                    <button type="submit" class="btn" data-i18n="sections.contact.form.submit">Send Message</button>
                </form>
            </div>
        </div>
    </section>
</main>

<button class="scroll-up-btn hidden" id="scrollUpBtn" aria-label="Scroll up"><i class="fas fa-chevron-up"></i></button>
<button class="scroll-down-btn" id="scrollDownBtn" aria-label="Scroll down"><i class="fas fa-chevron-down"></i></button>

<footer class="site-footer">
    <div class="footer-social-icons">
        <a href="https://github.com/a3emond" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
        <a href="https://www.linkedin.com/in/alexandre-emond-2750492a7" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
        <a href="mailto:admin@aedev.pro" aria-label="Email"><i class="fas fa-envelope"></i></a>
    </div>
    <div>&copy; 2025 AEDev — Alexandre Émond</div>
</footer>

<!-- Main scripts -->
<script type="module" src="static/lang.js"></script>
<script type="module" src="static/main.js" defer></script>
<script type="module" src="static/flip_card.js" defer></script>
<script type="module" src="static/skill_tree.js"></script>
</body>
</html>
