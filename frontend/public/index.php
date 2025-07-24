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

<!-- HEADER: Logo + Hamburger -->
<header class="sticky-header">
    <div class="container nav-container">
        <a href="#home"><img src="assets/logo_header.png" alt="AEDev Logo" class="logo" /></a>
        <div class="header-social-icons">
            <a href="https://github.com/a3emond" target="_blank" aria-label="GitHub">
                <i class="fab fa-github"></i>
            </a>
            <a href="https://linkedin.com/in/a3emond" target="_blank" aria-label="LinkedIn">
                <i class="fab fa-linkedin"></i>
            </a>
            <a href="mailto:admin@aedev.pro" aria-label="Email">
                <i class="fas fa-envelope"></i>
            </a>
        </div>
        <div class="hamburger" id="hamburger">
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>


</header>
<!-- Slide-down menu -->
<nav class="dropdown-menu" id="menu">
    <a href="#home">Home</a>
    <a href="#about">About</a>
    <a href="#projects">Projects</a>
    <a href="#skills">Skills</a>
    <a href="#contact">Contact</a>
</nav>
<!-- MAIN SECTIONS -->
<main class="snap-container">
    <section id="home" class="section snap-child">
        <div class="container">
            <h1>AEDev</h1>
            <p class="fade-in">Developer. Designer. Maker.</p>
        </div>
    </section>

    <section id="about" class="section snap-child">
        <div class="container">
            <h2>About Me</h2>
            <p>Hi, I'm Alexandre Émond — a full-stack developer and maker. I build modern tools and interactive experiences across web, embedded, and game platforms.</p>
        </div>
    </section>

    <section id="projects" class="section snap-child">
        <div class="container">
            <h2>Projects</h2>
            <p>Showcase coming soon...</p>
        </div>
    </section>

    <section id="skills" class="section snap-child">
        <div class="container">
            <h2>Skills</h2>
            <p>PHP, JS, HTML, CSS, C++, ESP32, WebGL, Docker, Linux...</p>
        </div>
    </section>

    <section id="contact" class="section snap-child">
        <div class="container">
            <h2>Contact Me</h2>
            <form action="contact.php" method="POST">
                <input type="text" name="name" placeholder="Your Name" required />
                <input type="email" name="email" placeholder="Your Email" required />
                <textarea name="message" placeholder="Your Message" rows="6" required></textarea>
                <button type="submit" class="btn">Send Message</button>
            </form>
        </div>
    </section>
</main>
<button class="scroll-down-btn" id="scrollDownBtn" aria-label="Scroll down">
    <i class="fas fa-chevron-down"></i>
</button>

<footer class="site-footer">
    <div class="footer-social-icons">
        <a href="https://github.com/a3emond" target="_blank" aria-label="GitHub">
            <i class="fab fa-github"></i>
        </a>
        <a href="https://linkedin.com/in/a3emond" target="_blank" aria-label="LinkedIn">
            <i class="fab fa-linkedin"></i>
        </a>
        <a href="mailto:admin@aedev.pro" aria-label="Email">
            <i class="fas fa-envelope"></i>
        </a>
    </div>
    <p>&copy; 2025 Alexandre Émond — AEDev</p>
</footer>


<script src="static/main.js"></script>
</body>
</html>
