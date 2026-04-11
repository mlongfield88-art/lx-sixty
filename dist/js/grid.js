/* =============================================
   LX SIXTY — Geometric Grid Animation
   Subtle architectural mesh with mouse interaction
   ============================================= */

(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('grid-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    const CONFIG = {
        spacing: 90,
        oscillationAmount: 10,
        oscillationSpeed: 0.0003,
        color: { r: 138, g: 133, b: 128 },       // stone grey
        lineOpacity: 0.07,
        lineWidth: 0.5,
        nodeRadius: 1.2,
        nodeOpacity: 0.12,
        mouseRadius: 280,
        mouseOpacityBoost: 0.14,
        mousePush: 8,
        diagonalFrequency: 3,
    };

    let nodes = [];
    let mouse = { x: -1000, y: -1000 };
    let dpr, cols, rows, w, h;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        w = canvas.offsetWidth;
        h = canvas.offsetHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildGrid();
    }

    function buildGrid() {
        nodes = [];
        cols = Math.ceil(w / CONFIG.spacing) + 2;
        rows = Math.ceil(h / CONFIG.spacing) + 2;
        const ox = (w - (cols - 1) * CONFIG.spacing) / 2;
        const oy = (h - (rows - 1) * CONFIG.spacing) / 2;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                nodes.push({
                    bx: ox + c * CONFIG.spacing,
                    by: oy + r * CONFIG.spacing,
                    x: 0, y: 0,
                    px: Math.random() * Math.PI * 2,
                    py: Math.random() * Math.PI * 2,
                    col: c, row: r,
                });
            }
        }
    }

    function nodeAt(c, r) {
        if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
        return nodes[r * cols + c];
    }

    function mouseInfluence(x, y) {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d > CONFIG.mouseRadius) return { boost: 0, pushX: 0, pushY: 0 };
        const t = 1 - d / CONFIG.mouseRadius;
        return {
            boost: t * CONFIG.mouseOpacityBoost,
            pushX: (dx / d) * t * CONFIG.mousePush,
            pushY: (dy / d) * t * CONFIG.mousePush,
        };
    }

    function line(a, b, opacity) {
        const { r, g, b: bl } = CONFIG.color;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${r},${g},${bl},${opacity})`;
        ctx.lineWidth = CONFIG.lineWidth;
        ctx.stroke();
    }

    function dot(n, opacity) {
        const { r, g, b } = CONFIG.color;
        ctx.beginPath();
        ctx.arc(n.x, n.y, CONFIG.nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${opacity})`;
        ctx.fill();
    }

    function frame(t) {
        ctx.clearRect(0, 0, w, h);

        // Update positions
        for (const n of nodes) {
            const mi = mouseInfluence(n.bx, n.by);
            n.x = n.bx
                + Math.sin(t * CONFIG.oscillationSpeed + n.px) * CONFIG.oscillationAmount
                + mi.pushX;
            n.y = n.by
                + Math.cos(t * CONFIG.oscillationSpeed * 0.7 + n.py) * CONFIG.oscillationAmount
                + mi.pushY;
        }

        // Draw connections + nodes
        for (const n of nodes) {
            const mi = mouseInfluence(n.x, n.y);

            // Right neighbour
            const right = nodeAt(n.col + 1, n.row);
            if (right) {
                const mx = (n.x + right.x) / 2, my = (n.y + right.y) / 2;
                line(n, right, CONFIG.lineOpacity + mouseInfluence(mx, my).boost);
            }

            // Below neighbour
            const below = nodeAt(n.col, n.row + 1);
            if (below) {
                const mx = (n.x + below.x) / 2, my = (n.y + below.y) / 2;
                line(n, below, CONFIG.lineOpacity + mouseInfluence(mx, my).boost);
            }

            // Diagonal (every Nth cell for subtlety)
            if ((n.col + n.row) % CONFIG.diagonalFrequency === 0) {
                const diag = nodeAt(n.col + 1, n.row + 1);
                if (diag) {
                    const mx = (n.x + diag.x) / 2, my = (n.y + diag.y) / 2;
                    line(n, diag, CONFIG.lineOpacity * 0.4 + mouseInfluence(mx, my).boost * 0.5);
                }
            }

            // Node dot
            dot(n, CONFIG.nodeOpacity + mi.boost);
        }

        requestAnimationFrame(frame);
    }

    // Events
    canvas.addEventListener('mousemove', function (e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    window.addEventListener('resize', resize);

    // Init
    resize();
    requestAnimationFrame(frame);
})();
