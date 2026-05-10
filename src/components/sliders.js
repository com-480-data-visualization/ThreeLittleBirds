'use strict';

const sliderState = {
    year:    { min: 0, max: 0 },
    altitude:{ min: 0,    max: 0 },
    month:   { min: 1,    max: 12 },
    sky:     null,
    phase:   null,
    timeofday: null,
};

export function getSliderFilter() {
    return function (d) {

        const year = +d.INCIDENT_YEAR;
        if (year <= sliderState.year.min || year >= sliderState.year.max) return false;

        const alt = +d.HEIGHT;
        if (alt <= sliderState.altitude.min || alt >= sliderState.altitude.max) return false;

        const month = +d.INCIDENT_MONTH;
        const { min: mMin, max: mMax } = sliderState.month;
        if (mMin <= mMax) {
            if (month < mMin || month > mMax) return false;
        } else {
            if (month < mMin && month > mMax) return false;
        }

        if (sliderState.sky      && d.SKY          !== sliderState.sky)      return false;
        if (sliderState.phase    && d.PHASE_OF_FLIGHT !== sliderState.phase)  return false;
        if (sliderState.timeofday && d.TIME_OF_DAY  !== sliderState.timeofday) return false;

        return true;
    };
}

export function init_sliders(data, onChangeCallback) {
    let ready = false;
    let notifyTimer = null;
    const notify = () => {
        if (!ready) return;
        clearTimeout(notifyTimer);
        notifyTimer = setTimeout(() => {
            onChangeCallback(getSliderFilter());
        }, 150);
    };
    const container = document.getElementById('sliders');
    if (!container) return;
    container.innerHTML = '';

    const years = data.map(d => +d.INCIDENT_YEAR).filter(Boolean);
    const altitudes = data.map(d => +d.HEIGHT).filter(v => !isNaN(v));
    const dataMinYear = years.reduce((a, b) => a < b ? a : b, 1990);
    const dataMaxYear = years.reduce((a, b) => a > b ? a : b, 2024);
    const dataMaxAlt  = altitudes.reduce((a, b) => a > b ? a : b, 10000);

    sliderState.year     = { min: dataMinYear, max: dataMaxYear };
    sliderState.altitude = { min: 0, max: dataMaxAlt };

    const skies   = [...new Set(data.map(d => d.SKY).filter(Boolean))].sort();
    const phases  = [...new Set(data.map(d => d.PHASE_OF_FLIGHT).filter(Boolean))].sort();
    const times   = [...new Set(data.map(d => d.TIME_OF_DAY).filter(Boolean))].sort();

    function buildUI() {
        const topBar = createElement('div', 'sliders-topbar');
        const resetBtn = createElement('button', 'reset-btn');
        resetBtn.textContent = '↺ Reset';
        resetBtn.addEventListener('click', () => {
            sliderState.year     = { min: dataMinYear, max: dataMaxYear };
            sliderState.altitude = { min: 0, max: dataMaxAlt };
            sliderState.month    = { min: 1, max: 12 };
            sliderState.sky      = null;
            sliderState.phase    = null;
            sliderState.timeofday = null;
            ready = false;
            container.innerHTML = '';
            buildUI();
            ready = true;
            notify();
        });
        topBar.appendChild(resetBtn);
        container.appendChild(topBar);

        container.appendChild(makeSectionTitle('Numeric Filters'));
        container.appendChild(makeDualSlider('Year', dataMinYear, dataMaxYear, 1, 'year', notify, v => v));
        container.appendChild(makeDualSlider('Altitude', 0, dataMaxAlt, 500, 'altitude', notify, v => v.toLocaleString() + ' ft'));
        container.appendChild(makeSectionTitle('Month Range'));
        container.appendChild(makeCircularMonthPicker(notify));
        container.appendChild(makeSectionTitle('Categorical Filters'));
        container.appendChild(makeChipFilter('Sky', skies, 'sky', notify));
        container.appendChild(makeChipFilter('Phase of Flight', phases, 'phase', notify));
        container.appendChild(makeChipFilter('Time of Day', times, 'timeofday', notify));
    }
    buildUI();
    ready = true;
}

function makeDualSlider(label, min, max, step, stateKey, notify, formatFn) {
    const wrap = createElement('div', 'slider-block');
    const header = createElement('div', 'slider-header');
    const sliderLabel  = createElement('span', 'slider-label');  sliderLabel.textContent = label;
    const values = createElement('span', 'slider-values'); values.textContent = `${formatFn(min)} – ${formatFn(max)}`;
    header.append(sliderLabel, values);

    const track  = createElement('div', 'dual-track');
    const fill   = createElement('div', 'dual-fill');
    const thumbL = createElement('div', 'dual-thumb thumb-left');
    const thumbR = createElement('div', 'dual-thumb thumb-right');
    track.append(fill, thumbL, thumbR);

    let lowVal  = min;
    let highVal = max;

    function update() {
        const pctL = (lowVal  - min) / (max - min) * 100;
        const pctR = (highVal - min) / (max - min) * 100;
        thumbL.style.left = pctL + '%';
        thumbR.style.left = pctR + '%';
        fill.style.left   = pctL + '%';
        fill.style.width  = (pctR - pctL) + '%';
        values.textContent  = `${formatFn(lowVal)} – ${formatFn(highVal)}`;
        sliderState[stateKey] = { min: lowVal, max: highVal };
        notify();
    }

    function dragThumb(thumb, isLeft) {
        thumb.addEventListener('mousedown', e => {
            e.preventDefault();
            const rect = track.getBoundingClientRect();
            const onMove = ev => {
                let pct = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                let val = Math.round((min + pct * (max - min)) / step) * step;
                val = Math.max(min, Math.min(max, val));
                if (isLeft) {
                    lowVal  = Math.min(val, highVal);
                }else{
                    highVal = Math.max(val, lowVal);
                }
                update();
            };
            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        });
    }

    dragThumb(thumbL, true);
    dragThumb(thumbR, false);
    update();

    wrap.append(header, track);
    return wrap;
}

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function makeCircularMonthPicker(notify) {
    const wrap = createElement('div', 'month-picker-wrap');

    const SIZE   = 220;
    const CX     = SIZE / 2;
    const CY     = SIZE / 2;
    const R_OUTER = 85;
    const R_INNER = 58;
    const R_THUMB = 92;
    const R_LABEL = 104;

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg   = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${SIZE} ${SIZE}`);
    svg.setAttribute('width',  SIZE);
    svg.setAttribute('height', SIZE);
    svg.style.overflow = 'visible';

    function monthToAngle(m) { return ((m - 1) / 12) * 360 - 90; }
    function angleToMonth(a) {
        let month = Math.round(((a + 90 + 360) % 360) / 360 * 12) + 1;
        if (month > 12) month = 1;
        if (month < 1)  month = 12;
        return month;
    }
    function polarToXY(angleDeg, r) {
        const radius = (angleDeg * Math.PI) / 180;
        return { x: CX + r * Math.cos(radius), y: CY + r * Math.sin(radius) };
    }
    function describeArc(startAngle, endAngle) {
        let delta = ((endAngle - startAngle) + 360) % 360;
        if (delta === 0) delta = 360;
        const large = delta > 180 ? 1 : 0;
        const startOuter = polarToXY(startAngle, R_OUTER);
        const endOuter = polarToXY(endAngle,   R_OUTER);
        const startInner = polarToXY(endAngle,  R_INNER);
        const endInner = polarToXY(startAngle,R_INNER);
        return `M ${startOuter.x} ${startOuter.y} A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${endOuter.x} ${endOuter.y}
            L ${startInner.x} ${startInner.y} A ${R_INNER} ${R_INNER} 0 ${large} 0 ${endInner.x} ${endInner.y} Z`;
    }

    const bgRing = document.createElementNS(svgNS, 'path');
    bgRing.setAttribute('d', describeArc(-90, 270));
    bgRing.setAttribute('class', 'month-bg');
    svg.appendChild(bgRing);

    const arcFill = document.createElementNS(svgNS, 'path');
    arcFill.setAttribute('class', 'month-fill');
    svg.appendChild(arcFill);

    MONTH_NAMES.forEach((name, i) => {
        const angle = monthToAngle(i + 1);
        const pos   = polarToXY(angle, R_LABEL);
        const text  = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'month-label-text');
        text.textContent = name;
        svg.appendChild(text);
    });

    function makeThumb(cls) {
        const g = document.createElementNS(svgNS, 'circle');
        g.setAttribute('r', 9);
        g.setAttribute('class', cls);
        svg.appendChild(g);
        return g;
    }

    const thumbStart = makeThumb('month-thumb');
    const thumbEnd   = makeThumb('month-thumb');

    const centerLabel = document.createElementNS(svgNS, 'text');
    centerLabel.setAttribute('x', CX);
    centerLabel.setAttribute('y', CY - 8);
    centerLabel.setAttribute('text-anchor', 'middle');
    centerLabel.setAttribute('class', 'month-center-label');
    svg.appendChild(centerLabel);

    const centerSub = document.createElementNS(svgNS, 'text');
    centerSub.setAttribute('x', CX);
    centerSub.setAttribute('y', CY + 10);
    centerSub.setAttribute('text-anchor', 'middle');
    centerSub.setAttribute('class', 'month-center-sub');
    centerSub.textContent = 'to';
    svg.appendChild(centerSub);

    const centerLabelEnd = document.createElementNS(svgNS, 'text');
    centerLabelEnd.setAttribute('x', CX);
    centerLabelEnd.setAttribute('y', CY + 26);
    centerLabelEnd.setAttribute('text-anchor', 'middle');
    centerLabelEnd.setAttribute('class', 'month-center-label');
    svg.appendChild(centerLabelEnd);

    let startMonth = 1;
    let endMonth   = 12;

    function redraw() {
        const aS = monthToAngle(startMonth);
        const aEfull = endMonth === 12 ? 270 : monthToAngle(endMonth);
        arcFill.setAttribute('d', describeArc(aS, aEfull === aS ? aS + 0.01 : aEfull));

        const ps = polarToXY(aS, R_THUMB);
        thumbStart.setAttribute('cx', ps.x);
        thumbStart.setAttribute('cy', ps.y);

        const pe = polarToXY(aEfull, R_THUMB);
        thumbEnd.setAttribute('cx', pe.x);
        thumbEnd.setAttribute('cy', pe.y);

        centerLabel.textContent    = MONTH_NAMES[startMonth - 1];
        centerLabelEnd.textContent = MONTH_NAMES[endMonth   - 1];

        sliderState.month = { min: startMonth, max: endMonth };
        notify();
    }

    function dragMonth(setFn) {
        return function (e) {
            e.preventDefault();
            const rect = svg.getBoundingClientRect();
            const onMove = ev => {
                const dx = ev.clientX - (rect.left + rect.width  / 2);
                const dy = ev.clientY - (rect.top  + rect.height / 2);
                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                setFn(angleToMonth(angle));
                redraw();
            };
            const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
        };
    }

    thumbStart.addEventListener('mousedown', dragMonth(m => { startMonth = m; }));
    thumbEnd.addEventListener('mousedown',   dragMonth(m => { endMonth   = m; }));

    redraw();
    wrap.appendChild(svg);
    return wrap;
}

function makeChipFilter(label, values, stateKey, notify) {
    const wrap = createElement('div', 'chip-block');
    const sliderLabel  = createElement('div', 'slider-label'); sliderLabel.textContent = label;
    wrap.appendChild(sliderLabel);

    const chipRow = createElement('div', 'chip-row');

    const allChip = createElement('button', 'chip chip-all active');
    allChip.textContent = 'All';
    allChip.addEventListener('click', () => {
        sliderState[stateKey] = null;
        chips.forEach(c => c.classList.remove('active'));
        allChip.classList.add('active');
        notify();
    });
    chipRow.appendChild(allChip);

    const chips = values.map(val => {
        const chip = createElement('button', 'chip');
        chip.textContent = val;
        chip.addEventListener('click', () => {
            allChip.classList.remove('active');
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            sliderState[stateKey] = val;
            notify();
        });
        chipRow.appendChild(chip);
        return chip;
    });

    wrap.appendChild(chipRow);
    return wrap;
}

function createElement(tag, cls) {
    const element = document.createElement(tag);
    if (cls) element.className = cls;
    return element;
}

function makeSectionTitle(text) {
    const t = createElement('div', 'section-title');
    t.textContent = text;
    return t;
}
