/*
 * Hero Topography Component
 * Lightweight SVG contour map with subtle parallax and ripple interaction
 */

(function () {
    'use strict';

    const SVG_WIDTH = 1600;
    const SVG_HEIGHT = 920;
    const GRID_STEP = 22;
    const LEVELS = Array.from({ length: 12 }, (_, index) => 0.2 + (index * 0.055));
    const EDGES = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0]
    ];
    const CASE_SEGMENTS = {
        0: [],
        1: [[3, 2]],
        2: [[2, 1]],
        3: [[3, 1]],
        4: [[0, 1]],
        5: [[0, 3], [1, 2]],
        6: [[0, 2]],
        7: [[0, 3]],
        8: [[0, 3]],
        9: [[0, 2]],
        10: [[0, 1], [2, 3]],
        11: [[0, 1]],
        12: [[3, 1]],
        13: [[2, 1]],
        14: [[3, 2]],
        15: []
    };
    const PERMUTATION = buildPermutationTable();

    function init(section, container) {
        if (!section || !container || container.dataset.topographyReady === 'true') {
            return;
        }

        container.dataset.topographyReady = 'true';
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        container.innerHTML = buildTopographySVG(SVG_WIDTH, SVG_HEIGHT);

        const rippleGroup = container.querySelector('[data-topo-ripple]');
        const rippleRings = rippleGroup
            ? Array.from(rippleGroup.querySelectorAll('[data-topo-ripple-ring]'))
            : [];

        let lastRippleTime = 0;

        const setShift = (x, y) => {
            container.style.setProperty('--topo-shift-x', `${x}px`);
            container.style.setProperty('--topo-shift-y', `${y}px`);
        };

        const triggerRipple = (x, y) => {
            if (!rippleGroup || prefersReducedMotion.matches) {
                return;
            }

            rippleGroup.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);

            rippleRings.forEach((ring, index) => {
                const scale = 1.18 + (index * 0.18);
                ring.getAnimations().forEach(animation => animation.cancel());
                ring.animate(
                    [
                        { opacity: 0.42, transform: 'scale(0.82)' },
                        { opacity: 0.24, offset: 0.35, transform: `scale(${(scale * 0.94).toFixed(2)})` },
                        { opacity: 0, transform: `scale(${scale.toFixed(2)})` }
                    ],
                    {
                        duration: 820 + (index * 90),
                        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                        fill: 'forwards'
                    }
                );
            });
        };

        const updateFromPointer = (clientX, clientY, ripple = false) => {
            const rect = section.getBoundingClientRect();
            const relativeX = ((clientX - rect.left) / rect.width) - 0.5;
            const relativeY = ((clientY - rect.top) / rect.height) - 0.5;
            const svgX = ((clientX - rect.left) / rect.width) * SVG_WIDTH;
            const svgY = ((clientY - rect.top) / rect.height) * SVG_HEIGHT;

            setShift(relativeX * -12, relativeY * -10);

            const now = window.performance.now();
            if (ripple && (now - lastRippleTime > 180)) {
                lastRippleTime = now;
                triggerRipple(svgX, svgY);
            }
        };

        const handlePointerMove = event => {
            if (prefersReducedMotion.matches) {
                return;
            }

            updateFromPointer(event.clientX, event.clientY, true);
        };

        const handleTouchMove = event => {
            if (prefersReducedMotion.matches) {
                return;
            }

            const touch = event.touches && event.touches[0];
            if (!touch) {
                return;
            }

            updateFromPointer(touch.clientX, touch.clientY, true);
        };

        const handlePointerLeave = () => setShift(0, 0);
        const handleMotionChange = () => {
            setShift(0, 0);
        };

        section.addEventListener('pointermove', handlePointerMove);
        section.addEventListener('pointerleave', handlePointerLeave);
        section.addEventListener('touchmove', handleTouchMove, { passive: true });
        prefersReducedMotion.addEventListener('change', handleMotionChange);

        window.addEventListener('beforeunload', () => {
            section.removeEventListener('pointermove', handlePointerMove);
            section.removeEventListener('pointerleave', handlePointerLeave);
            section.removeEventListener('touchmove', handleTouchMove);
            prefersReducedMotion.removeEventListener('change', handleMotionChange);
        }, { once: true });
    }

    function buildTopographySVG(width, height) {
        const grid = buildNormalizedGrid(width, height, GRID_STEP);
        const contourPaths = LEVELS.flatMap((level, index) => {
            const major = index % 4 === 0;
            return traceContours(grid, level).map(path => (
                `<path class="hero-topography__line${major ? ' hero-topography__line--major' : ''}" d="${path}" />`
            ));
        });

        const rippleRings = [34, 54, 78].map((radius, index) => `
            <g class="hero-topography__ripple-ring${index === 0 ? ' hero-topography__ripple-ring--major' : ''}" data-topo-ripple-ring>
                <path d="${buildRipplePath(radius, 40 + index)}" />
            </g>
        `).join('');

        return `
            <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" role="presentation">
                <g class="hero-topography__layer">
                    ${contourPaths.join('')}
                </g>
                <g class="hero-topography__ripple" data-topo-ripple transform="translate(-9999 -9999)">
                    ${rippleRings}
                </g>
            </svg>
        `;
    }

    function buildNormalizedGrid(width, height, step) {
        const columns = Math.ceil(width / step) + 1;
        const rows = Math.ceil(height / step) + 1;
        const values = Array.from({ length: rows }, () => new Array(columns));
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        for (let row = 0; row < rows; row++) {
            const y = row * step;

            for (let column = 0; column < columns; column++) {
                const x = column * step;
                const value = sampleField(x / width, y / height);
                values[row][column] = value;
                min = Math.min(min, value);
                max = Math.max(max, value);
            }
        }

        const range = Math.max(0.0001, max - min);

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                values[row][column] = (values[row][column] - min) / range;
            }
        }

        return { values, rows, columns, step, width, height };
    }

    function sampleField(nx, ny) {
        const warpX = fbm((nx * 1.1) + 1.8, (ny * 1.1) - 2.2);
        const warpY = fbm((nx * 1.1) - 6.4, (ny * 1.1) + 4.6);

        const sampleX = (nx * 2.35) + (warpX * 0.45);
        const sampleY = (ny * 1.9) + (warpY * 0.38);

        let value = fbm(sampleX, sampleY) * 0.72;
        value += fbm((sampleX * 1.9) + 7.4, (sampleY * 1.9) - 3.1) * 0.2;
        value += (nx * 0.22) - (ny * 0.08);
        value += Math.sin((ny * 5.2) + (warpX * 1.7)) * 0.018;
        value -= Math.cos((nx * 4.6) - (warpY * 1.2)) * 0.015;

        return value;
    }

    function fbm(x, y) {
        let value = 0;
        let amplitude = 0.5;
        let frequency = 1;
        let totalAmplitude = 0;

        for (let octave = 0; octave < 4; octave++) {
            value += perlin(x * frequency, y * frequency) * amplitude;
            totalAmplitude += amplitude;
            amplitude *= 0.52;
            frequency *= 2;
        }

        return value / totalAmplitude;
    }

    function perlin(x, y) {
        const xi = Math.floor(x) & 255;
        const yi = Math.floor(y) & 255;
        const xf = x - Math.floor(x);
        const yf = y - Math.floor(y);
        const u = fade(xf);
        const v = fade(yf);

        const aa = PERMUTATION[PERMUTATION[xi] + yi];
        const ab = PERMUTATION[PERMUTATION[xi] + yi + 1];
        const ba = PERMUTATION[PERMUTATION[xi + 1] + yi];
        const bb = PERMUTATION[PERMUTATION[xi + 1] + yi + 1];

        const x1 = lerp(gradient(aa, xf, yf), gradient(ba, xf - 1, yf), u);
        const x2 = lerp(gradient(ab, xf, yf - 1), gradient(bb, xf - 1, yf - 1), u);
        return lerp(x1, x2, v);
    }

    function buildPermutationTable() {
        const base = Array.from({ length: 256 }, (_, index) => index);
        let seed = 421;

        for (let index = base.length - 1; index > 0; index--) {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            const swapIndex = seed % (index + 1);
            const temp = base[index];
            base[index] = base[swapIndex];
            base[swapIndex] = temp;
        }

        return base.concat(base);
    }

    function gradient(hash, x, y) {
        switch (hash & 7) {
            case 0: return x + y;
            case 1: return -x + y;
            case 2: return x - y;
            case 3: return -x - y;
            case 4: return x;
            case 5: return -x;
            case 6: return y;
            default: return -y;
        }
    }

    function fade(value) {
        return value * value * value * (value * ((value * 6) - 15) + 10);
    }

    function traceContours(grid, level) {
        const segments = [];
        const adjacency = new Map();

        for (let row = 0; row < grid.rows - 1; row++) {
            const top = row * grid.step;
            const bottom = Math.min(grid.height, (row + 1) * grid.step);

            for (let column = 0; column < grid.columns - 1; column++) {
                const left = column * grid.step;
                const right = Math.min(grid.width, (column + 1) * grid.step);
                const values = [
                    grid.values[row][column],
                    grid.values[row][column + 1],
                    grid.values[row + 1][column + 1],
                    grid.values[row + 1][column]
                ];
                const corners = [
                    { x: left, y: top },
                    { x: right, y: top },
                    { x: right, y: bottom },
                    { x: left, y: bottom }
                ];

                let mask = 0;
                if (values[0] >= level) mask |= 1;
                if (values[1] >= level) mask |= 2;
                if (values[2] >= level) mask |= 4;
                if (values[3] >= level) mask |= 8;

                const cellSegments = CASE_SEGMENTS[mask];
                if (!cellSegments || !cellSegments.length) {
                    continue;
                }

                cellSegments.forEach(([edgeA, edgeB]) => {
                    const pointA = interpolatePoint(edgeA, corners, values, level);
                    const pointB = interpolatePoint(edgeB, corners, values, level);
                    const segment = [pointA, pointB];
                    const segmentIndex = segments.push(segment) - 1;

                    [pointA, pointB].forEach(point => {
                        const key = pointKey(point);
                        const entries = adjacency.get(key) || [];
                        entries.push(segmentIndex);
                        adjacency.set(key, entries);
                    });
                });
            }
        }

        const used = new Set();
        const paths = [];

        for (let index = 0; index < segments.length; index++) {
            if (used.has(index)) {
                continue;
            }

            const polyline = tracePolyline(index, segments, adjacency, used);
            if (polyline.length > 2) {
                paths.push(polylineToPath(polyline));
            }
        }

        return paths;
    }

    function tracePolyline(startIndex, segments, adjacency, used) {
        const [startPoint, endPoint] = segments[startIndex];
        const line = [startPoint, endPoint];
        used.add(startIndex);

        extendPolyline(line, false, segments, adjacency, used);
        extendPolyline(line, true, segments, adjacency, used);

        return line;
    }

    function extendPolyline(line, reverse, segments, adjacency, used) {
        let activePoint = reverse ? line[0] : line[line.length - 1];

        while (true) {
            const nextSegmentIndex = (adjacency.get(pointKey(activePoint)) || [])
                .find(index => !used.has(index));

            if (nextSegmentIndex === undefined) {
                break;
            }

            used.add(nextSegmentIndex);
            const [pointA, pointB] = segments[nextSegmentIndex];
            const nextPoint = pointKey(pointA) === pointKey(activePoint) ? pointB : pointA;

            if (reverse) {
                line.unshift(nextPoint);
                activePoint = line[0];
            } else {
                line.push(nextPoint);
                activePoint = line[line.length - 1];
            }
        }
    }

    function polylineToPath(points) {
        if (points.length < 2) {
            return '';
        }

        const closed = pointDistance(points[0], points[points.length - 1]) < 1.5;
        const workingPoints = closed ? points.slice(0, -1) : points.slice();

        if (workingPoints.length < 2) {
            return '';
        }

        if (!closed) {
            let path = `M ${workingPoints[0].x.toFixed(1)} ${workingPoints[0].y.toFixed(1)}`;

            for (let index = 1; index < workingPoints.length - 1; index++) {
                const current = workingPoints[index];
                const next = workingPoints[index + 1];
                const midX = ((current.x + next.x) / 2).toFixed(1);
                const midY = ((current.y + next.y) / 2).toFixed(1);
                path += ` Q ${current.x.toFixed(1)} ${current.y.toFixed(1)} ${midX} ${midY}`;
            }

            const last = workingPoints[workingPoints.length - 1];
            path += ` T ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;
            return path;
        }

        let path = `M ${workingPoints[0].x.toFixed(1)} ${workingPoints[0].y.toFixed(1)}`;

        for (let index = 1; index <= workingPoints.length; index++) {
            const current = workingPoints[index % workingPoints.length];
            const next = workingPoints[(index + 1) % workingPoints.length];
            const midX = ((current.x + next.x) / 2).toFixed(1);
            const midY = ((current.y + next.y) / 2).toFixed(1);
            path += ` Q ${current.x.toFixed(1)} ${current.y.toFixed(1)} ${midX} ${midY}`;
        }

        path += ' Z';
        return path;
    }

    function interpolatePoint(edgeIndex, corners, values, level) {
        const [startCorner, endCorner] = EDGES[edgeIndex];
        const start = corners[startCorner];
        const end = corners[endCorner];
        const startValue = values[startCorner];
        const endValue = values[endCorner];
        const denominator = endValue - startValue;
        const ratio = Math.abs(denominator) < 0.00001 ? 0.5 : (level - startValue) / denominator;
        const t = Math.max(0, Math.min(1, ratio));

        return {
            x: start.x + ((end.x - start.x) * t),
            y: start.y + ((end.y - start.y) * t)
        };
    }

    function buildRipplePath(radius, seed) {
        const points = [];
        const steps = 28;

        for (let index = 0; index <= steps; index++) {
            const theta = (index / steps) * Math.PI * 2;
            const wobble =
                (Math.sin((theta * 3) + (seed * 0.12)) * 0.16) +
                (Math.cos((theta * 5) - (seed * 0.08)) * 0.08);
            const scaledRadius = radius * (1 + wobble);
            points.push({
                x: Math.cos(theta) * scaledRadius,
                y: Math.sin(theta) * scaledRadius
            });
        }

        return polylineToPath(points);
    }

    function pointKey(point) {
        return `${Math.round(point.x * 10)}:${Math.round(point.y * 10)}`;
    }

    function pointDistance(pointA, pointB) {
        const dx = pointA.x - pointB.x;
        const dy = pointA.y - pointB.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    }

    function lerp(start, end, amount) {
        return start + ((end - start) * amount);
    }

    window.HeroTopography = {
        init
    };
})();
