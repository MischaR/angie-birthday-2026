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
    let fireworks = [];

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

    function animate() {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fades out the fireworks
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        if (window.scrollY < window.innerHeight && Math.random() < 0.05) {
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

    // Expose celebration function globally
    window.celebrate = function () {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                fireworks.push(new Firework());
            }, i * 200);
        }
    };

    // Floating Emojis
    const emojis = ['❤️', '✨', '💙', '💛', '🇨🇴', '🇩🇪', '🥂', '🌸'];
    const container = document.body;

    function createFloatingEmoji() {
        const el = document.createElement('div');
        el.innerText = emojis[Math.floor(Math.random() * emojis.length)];
        el.className = 'floating-emoji';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.fontSize = Math.random() * 20 + 20 + 'px';
        el.style.animationDuration = Math.random() * 10 + 10 + 's';
        el.style.animationDelay = Math.random() * 5 + 's';

        container.appendChild(el);

        setTimeout(() => {
            el.remove();
        }, 20000);
    }

    for (let i = 0; i < 15; i++) {
        setTimeout(createFloatingEmoji, i * 500);
    }

    setInterval(createFloatingEmoji, 1500);

    animate();
});

// Present Game Logic (Global Scope)
let wrongAttempts = 0;

function handleCardClick(element) {
    if (element.classList.contains('disabled')) return;

    const type = element.getAttribute('data-type');
    const instruction = document.querySelector('.game-instruction');
    const correctCard = document.querySelector('.card[data-type="correct"]');

    if (type === 'wrong') {
        // Shake animation
        element.classList.add('shake');
        element.style.background = '#ffe6e6';
        wrongAttempts++;

        // Feedback
        const heading = element.querySelector('h3').innerText;
        if (heading === 'Textbooks') {
            instruction.innerText = "No way! MBA is finished! 🎉";
        } else if (heading === 'Winter Coat') {
            instruction.innerText = "Nope! It's going to be way warmer! ☀️";
        }

        // Disable card after shake
        setTimeout(() => {
            element.classList.remove('shake');
            element.classList.add('disabled');
            element.style.opacity = '0.5';
            element.style.cursor = 'default';
        }, 500);

        // Check availability
        if (wrongAttempts >= 2) {
            // If 2 wrong, highlight correct one
            correctCard.style.transition = "all 0.5s ease";
            correctCard.style.boxShadow = "0 0 30px var(--accent-gold)";
            correctCard.style.transform = "scale(1.1)";
            instruction.innerText = "Hint: They are waiting for you... ❤️";
        }

    } else if (type === 'correct') {
        triggerSuccess(element);
    }
}

function triggerSuccess(card) {
    const instruction = document.querySelector('.game-instruction');
    const cards = document.querySelectorAll('.card');
    const ticket = document.getElementById('ticket-reveal');

    // 1. Update text
    instruction.innerText = "You guessed it. Enjoy some lovely time with your family in Colombia, mi cosita linda. Te amo mucho! 🇨🇴✈️";
    instruction.style.color = "var(--accent-red)";
    instruction.style.fontWeight = "bold";

    // 2. Hide wrong cards
    cards.forEach(c => {
        if (c !== card) {
            c.style.opacity = '0';
            c.style.transform = 'scale(0)';
            c.style.pointerEvents = 'none';
        }
    });

    // 3. Explode correct card
    card.style.transition = "transform 0.5s ease";
    card.style.transform = "scale(1.5) rotate(360deg)";

    setTimeout(() => {
        card.style.opacity = '0';
        card.style.display = 'none';

        // Hide container to remove extra margin/gap
        document.querySelector('.game-container').style.display = 'none';

        // Reduce instruction margin
        document.querySelector('.game-instruction').style.marginBottom = '20px';

        // Show Ticket
        ticket.classList.remove('hidden');
        ticket.classList.add('visible');

        // Scroll to ticket smoothly
        ticket.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Enable Fireworks for Finale (Fix to viewport)
        const canvas = document.getElementById('fireworksCanvas');
        canvas.classList.add('fireworks-fixed');

        // Celebration!
        if (window.celebrate) window.celebrate();
        if (typeof launchConfetti === 'function') launchConfetti();

    }, 600);
}

function launchConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = window.innerHeight;
            const conf = document.createElement('div');
            conf.innerText = "🇨🇴";
            conf.style.position = 'fixed';
            conf.style.left = x + 'px';
            conf.style.bottom = '0px';
            conf.style.fontSize = Math.random() * 20 + 20 + 'px';
            conf.style.transition = "all 2s ease-out";
            conf.style.zIndex = "9999";
            document.body.appendChild(conf);

            setTimeout(() => {
                conf.style.transform = `translateY(-${Math.random() * 80 + 20}vh) rotate(${Math.random() * 720}deg)`;
                conf.style.opacity = '0';
            }, 50);

            setTimeout(() => conf.remove(), 2500);
        }, i * 50);
    }
}
