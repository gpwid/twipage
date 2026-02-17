(function () {
    const canvas = document.getElementById('ribbon-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;

    const GRAVITY = 0.4;
    const FRICTION = 0.9;
    const SEGMENTS = 20;
    const SLACK = 0.7;

    const ropes = [];

    class Point {
        constructor(x, y, pinned = false) {
            this.x = x;
            this.y = y;
            this.oldx = x;
            this.oldy = y;
            this.pinned = pinned;
        }

        update() {
            if (this.pinned) return;
            const vx = (this.x - this.oldx) * FRICTION;
            const vy = (this.y - this.oldy) * FRICTION;
            this.oldx = this.x;
            this.oldy = this.y;
            this.x += vx;
            this.y += vy;
            this.y += GRAVITY;
        }

        applyImpulse(x, y) {
            this.oldx -= x;
            this.oldy -= y;
        }
    }

    class Stick {
        constructor(p1, p2, length) {
            this.p1 = p1;
            this.p2 = p2;
            this.length = length;
        }

        update() {
            const dx = this.p2.x - this.p1.x;
            const dy = this.p2.y - this.p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist === 0) return;

            const diff = this.length - dist;
            const percent = diff / dist / 2;
            const offsetX = dx * percent;
            const offsetY = dy * percent;

            if (!this.p1.pinned) {
                this.p1.x -= offsetX;
                this.p1.y -= offsetY;
            }
            if (!this.p2.pinned) {
                this.p2.x += offsetX;
                this.p2.y += offsetY;
            }
        }
    }

    class Rope {
        constructor(startEl, endEl) {
            this.startEl = startEl;
            this.endEl = endEl;
            this.points = [];
            this.sticks = [];
            this.init();
        }

        getPinPos(el) {
            const rect = el.getBoundingClientRect();
            return {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
        }

        init() {
            this.points = [];
            this.sticks = [];
            const r1 = this.getPinPos(this.startEl);
            const r2 = this.getPinPos(this.endEl);
            const dist = Math.sqrt(Math.pow(r2.x - r1.x, 2) + Math.pow(r2.y - r1.y, 2));
            const totalLen = dist * SLACK;
            const segLen = totalLen / SEGMENTS;

            for (let i = 0; i <= SEGMENTS; i++) {
                const x = r1.x + (r2.x - r1.x) * (i / SEGMENTS);
                const y = r1.y + (r2.y - r1.y) * (i / SEGMENTS);
                const pinned = (i === 0 || i === SEGMENTS);
                this.points.push(new Point(x, y, pinned));
            }

            for (let i = 0; i < SEGMENTS; i++) {
                this.sticks.push(new Stick(this.points[i], this.points[i + 1], segLen));
            }
        }

        updatePins() {
            const r1 = this.getPinPos(this.startEl);
            const r2 = this.getPinPos(this.endEl);

            this.points[0].x = r1.x;
            this.points[0].y = r1.y;

            this.points[this.points.length - 1].x = r2.x;
            this.points[this.points.length - 1].y = r2.y;
        }

        update() {
            this.updatePins();
            for (const p of this.points) p.update();
            for (let i = 0; i < 5; i++) {
                for (const s of this.sticks) s.update();
            }
        }

        draw(ctx) {
            if (this.points.length < 2) return;

            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);

            for (let i = 1; i < this.points.length - 1; i++) {
                const xc = (this.points[i].x + this.points[i + 1].x) / 2;
                const yc = (this.points[i].y + this.points[i + 1].y) / 2;
                ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
            }

            ctx.quadraticCurveTo(
                this.points[this.points.length - 1].x,
                this.points[this.points.length - 1].y,
                this.points[this.points.length - 1].x,
                this.points[this.points.length - 1].y
            );

            ctx.strokeStyle = '#c0392b';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.stroke();
            ctx.shadowColor = 'transparent';
        }

        shake() {
            for (let i = 1; i < this.points.length - 1; i++) {
                if (Math.random() > 0.5) {
                    const force = 5 + Math.random() * 10;
                    this.points[i].applyImpulse((Math.random() - 0.5) * force, (Math.random() - 0.5) * force);
                }
            }
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        ropes.forEach(r => r.init());
    }

    function loop() {
        if (width <= 768) {
            requestAnimationFrame(loop);
            return;
        }
        ctx.clearRect(0, 0, width, height);
        ropes.forEach(r => {
            r.update();
            r.draw(ctx);
        });
        requestAnimationFrame(loop);
    }

    function init() {
        resize();
        const pinPol = document.getElementById('pin-polaroid');
        const pinMain = document.getElementById('pin-main');
        const pinStick = document.getElementById('pin-sticky');
        const pinStick2 = document.getElementById('pin-sticky-2');

        ropes.length = 0;

        if (pinPol && pinMain) ropes.push(new Rope(pinPol, pinMain));
        if (pinMain && pinStick) ropes.push(new Rope(pinMain, pinStick));
        if (pinMain && pinStick2) ropes.push(new Rope(pinMain, pinStick2));

        window.removeEventListener('resize', resize);
        window.addEventListener('resize', resize);

        const polaroid = document.getElementById('polaroid');
        const sticky = document.getElementById('sticky-note');
        const sticky2 = document.getElementById('sticky-note-2');

        if (polaroid) {
            polaroid.addEventListener('click', () => ropes[0] && ropes[0].shake());
            polaroid.addEventListener('mouseenter', () => ropes[0] && ropes[0].shake());
        }

        if (sticky) {
            sticky.addEventListener('click', () => ropes[1] && ropes[1].shake());
            sticky.addEventListener('mouseenter', () => ropes[1] && ropes[1].shake());
        }

        if (sticky2) {
            sticky2.addEventListener('click', () => ropes[2] && ropes[2].shake());
            sticky2.addEventListener('mouseenter', () => ropes[2] && ropes[2].shake());
        }

        requestAnimationFrame(loop);
    }

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
