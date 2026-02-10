document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });

    // Fireworks Animation
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    // Colombian colors for fireworks
    const colors = ['#FFCD00', '#003087', '#C8102E'];

    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 4 + 1;
            this.vx = Math.cos(angle) * velocity;
            this.vy = Math.sin(angle) * velocity;
            this.life = 100;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.01;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.05; // gravity
            this.life -= 1;
            this.alpha -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    class Firework {
        constructor() {
            this.x = Math.random() * width;
            this.y = height;
            this.targetY = Math.random() * (height * 0.5);
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = -Math.random() * 10 - 10;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.exploded = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.15; // gravity

            if (this.vy >= 0 || this.y <= this.targetY) {
                this.explode();
                return false; // remove firework
            }
            return true;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        explode() {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }

    let fireworks = [];

    function animate() {
        ctx.fillStyle = 'rgba(251, 251, 253, 0.2)'; // fade effect matching bg color
        ctx.fillRect(0, 0, width, height);

        if (Math.random() < 0.05) {
            fireworks.push(new Firework());
        }

        fireworks = fireworks.filter(fw => {
            fw.draw();
            return fw.update();
        });

        particles = particles.filter(p => {
            p.update();
            p.draw();
            return p.alpha > 0;
        });

        requestAnimationFrame(animate);
    }

    // Floating Emojis
    const emojis = ['❤️', '✨', '💙', '💛', '🇨🇴', '🇩🇪', '🥂', '🌸'];
    const container = document.body;

    function createFloatingEmoji() {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.className = 'floating-emoji';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.fontSize = Math.random() * 20 + 20 + 'px'; // 20px - 40px
        el.style.animationDuration = Math.random() * 10 + 10 + 's'; // 10s - 20s
        el.style.animationDelay = Math.random() * 5 + 's';

        container.appendChild(el);

        // Remove after animation
        setTimeout(() => {
            el.remove();
        }, 20000); // Max duration
    }

    // Create initial batch
    for (let i = 0; i < 15; i++) {
        setTimeout(createFloatingEmoji, i * 500);
    }

    // Continuous creation
    setInterval(createFloatingEmoji, 1500);

    animate();
});
