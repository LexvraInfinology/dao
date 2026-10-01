'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export const LandingSimulator: React.FC = () => {
  const [seat, setSeat] = useState<number>(100);
  const autoRef = useRef(true);
  const secRef = useRef<HTMLElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const isDraggingChartRef = useRef(false);
  const x5Ref = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLSpanElement>(null);

  // Calculations
  const back = 300 / seat;
  const rest = 300 - back;

  const f = (val: number) => {
    return '$' + (Number.isInteger(val) ? val : val.toFixed(2));
  };

  // Sweep animation on intersect
  useEffect(() => {
    let sweepRafId: number | null = null;
    let io: IntersectionObserver | null = null;

    const sweep = () => {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) {
        setSeat(10);
        return;
      }
      let t0: number | null = null;
      const D = 4200;
      let lastVal = 100;
      const step = (ts: number) => {
        if (!autoRef.current) return;
        if (t0 === null) t0 = ts;
        const t = Math.min(1, (ts - t0) / D);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const nextVal = Math.max(1, Math.min(100, Math.round(Math.pow(100, 1 - e))));
        if (nextVal !== lastVal) {
          lastVal = nextVal;
          setSeat(nextVal);
        }
        if (t < 1) {
          sweepRafId = requestAnimationFrame(step);
        }
      };
      sweepRafId = requestAnimationFrame(step);
    };

    if (secRef.current) {
      try {
        io = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              io?.disconnect();
              sweep();
            }
          },
          { threshold: 0.4 }
        );
        io.observe(secRef.current);
      } catch {
        sweep();
      }
    }

    return () => {
      if (sweepRafId) cancelAnimationFrame(sweepRafId);
      io?.disconnect();
    };
  }, []);

  // Cap rolling counter and x5 animation
  useEffect(() => {
    let capRafId: number | null = null;
    const x = x5Ref.current;
    const cap = capRef.current;

    function go() {
      if (!x || !cap) return;
      x.classList.add('on');
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
      let t0: number | null = null;
      function st(ts: number) {
        if (!cap) return;
        if (t0 === null) t0 = ts;
        const t = Math.min(1, (ts - t0) / 1100);
        cap.textContent = Math.round(300 + 1200 * (1 - Math.pow(1 - t, 3))).toLocaleString('en-US');
        if (t < 1) {
          capRafId = requestAnimationFrame(st);
        }
      }
      cap.textContent = '300';
      capRafId = requestAnimationFrame(st);
    }

    let o: IntersectionObserver | null = null;
    if (x) {
      try {
        o = new IntersectionObserver(
          (e) => {
            if (e[0].isIntersecting) {
              o?.disconnect();
              go();
            }
          },
          { threshold: 0.6 }
        );
        o.observe(x);
      } catch {
        go();
      }
    }

    return () => {
      if (capRafId) cancelAnimationFrame(capRafId);
      o?.disconnect();
    };
  }, []);

  const handlePointerUpdate = (clientX: number) => {
    if (!chartRef.current) return;
    const rc = chartRef.current.getBoundingClientRect();
    if (rc.width > 0) {
      const raw = ((clientX - rc.left) / rc.width) * 100 + 0.5;
      const nextSeat = Math.max(1, Math.min(100, Math.round(raw)));
      autoRef.current = false;
      setSeat(nextSeat);
    }
  };

  const onChartPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    autoRef.current = false;
    isDraggingChartRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    handlePointerUpdate(e.clientX);
  };

  const onChartPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingChartRef.current) {
      handlePointerUpdate(e.clientX);
    }
  };

  const onChartPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingChartRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <section id="simulator" className="scroll-mt-28 py-8 sm:py-14 lg:py-16 bg-[#FFFFFF] relative overflow-hidden border-b border-slate-200/80 flex justify-center px-3 sm:px-6">
      <style dangerouslySetInnerHTML={{ __html: `
        #simulator {
          --ink: #0a1128;
          --blue: #1a5cff;
          --green: #10b76a;
          --mute: #6b7a90;
          --tile: #eff2f7;
          --line: #e8ecf3;
          --mint: #ecfdf5;
          --mintline: #b9f0d5;
          --glow: rgba(26,92,255,.35);
        }
        #simulator .card {
          width: 100%;
          max-width: 800px;
          background: #fff;
          border: 1px solid var(--line);
          border-radius: 32px;
          padding: 44px 48px;
          box-shadow: 0 30px 80px -30px rgba(10,17,40,.18);
          box-sizing: border-box;
          color: var(--ink);
          font-family: var(--font-poppins), 'Poppins', system-ui, sans-serif;
          transition: max-width .3s ease;
        }
        #simulator .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--line);
          margin-bottom: 28px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        #simulator .top span {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #simulator .top i {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--green);
        }
        #simulator .top .r {
          color: var(--blue);
        }
        #simulator .top .r i {
          background: var(--blue);
        }
        #simulator h2 {
          font-size: clamp(28px, 5vw, 40px);
          line-height: 1.05;
          margin: 0 0 8px;
          font-weight: 800;
          letter-spacing: -.02em;
          color: var(--ink);
        }
        #simulator h2 em {
          font-style: normal;
          color: var(--blue);
        }
        #simulator .sub {
          color: var(--mute);
          margin: 0 0 28px;
          font-size: 14px;
        }
        #simulator .sub b {
          color: var(--ink);
        }
        #simulator .hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        #simulator .seat,
        #simulator .ret {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--mute);
        }
        #simulator .ret {
          text-align: right;
        }
        #simulator .seat strong,
        #simulator .ret strong {
          display: block;
          font-size: 48px;
          line-height: 1.05;
          font-weight: 800;
          letter-spacing: -.02em;
          text-transform: none;
          font-variant-numeric: tabular-nums;
        }
        #simulator .seat strong {
          color: var(--ink);
        }
        #simulator .ret strong {
          color: var(--blue);
          text-shadow: 0 0 30px var(--glow);
        }
        #simulator .chart {
          height: 170px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
          cursor: ew-resize;
          touch-action: pan-y;
          user-select: none;
        }
        #simulator .b {
          flex: 1;
          background: var(--tile);
          border-radius: 4px 4px 0 0;
          min-height: 4px;
          transition: background .15s;
        }
        #simulator .b.e {
          background: var(--ink);
        }
        #simulator .b.s {
          background: var(--blue);
          box-shadow: 0 0 20px var(--glow);
          min-height: 8px;
        }
        #simulator .axis {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--mute);
          margin: 10px 0 12px;
        }
        #simulator input[type=range] {
          width: 100%;
          accent-color: var(--blue);
          margin: 0 0 26px;
        }
        #simulator .split {
          display: flex;
          height: 50px;
          border-radius: 16px;
          overflow: hidden;
          background: var(--tile);
        }
        #simulator .split div {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          transition: width .12s linear;
        }
        #simulator #pe {
          background: var(--ink);
        }
        #simulator #py {
          background: var(--blue);
        }
        #simulator .legend {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--mute);
          margin-top: 12px;
        }
        #simulator .legend i {
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          margin-right: 8px;
        }
        #simulator .math {
          margin-top: 24px;
          text-align: center;
          font-size: 14px;
          color: var(--mute);
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          background: var(--mint);
          border: 1px solid var(--mintline);
          border-radius: 16px;
          padding: 16px;
        }
        #simulator .math b {
          color: var(--ink);
        }
        #simulator .chips {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 6px;
          margin-top: 18px;
        }
        #simulator .chips button {
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .02em;
          border: 0;
          background: var(--tile);
          color: var(--mute);
          padding: 8px 2px;
          border-radius: 12px;
          cursor: pointer;
          transition: .15s;
          text-align: center;
          white-space: nowrap;
        }
        @media(min-width: 640px) {
          #simulator .chips {
            display: flex;
            gap: 8px;
            justify-content: center;
          }
          #simulator .chips button {
            padding: 10px 16px;
            font-size: 12px;
            border-radius: 14px;
          }
        }
        #simulator .chips button:hover,
        #simulator .chips button.active {
          background: var(--ink);
          color: #fff;
        }
        #simulator .info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 36px;
        }
        #simulator .ic {
          border-radius: 22px;
          padding: 26px;
          border: 1px solid var(--line);
          background: #f8f9fc;
        }
        #simulator .ic.g {
          background: #e9fbf2;
          border-color: var(--mintline);
        }
        #simulator .ico {
          width: 50px;
          height: 50px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eaf2ff;
          border: 1px solid #d6e4ff;
          color: var(--blue);
          margin-bottom: 22px;
        }
        #simulator .g .ico {
          background: #fff;
          border-color: var(--mintline);
          color: #0a7a4b;
        }
        #simulator .ic h4 {
          margin: 0 0 6px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
          color: var(--blue);
        }
        #simulator .g h4 {
          color: #0a7a4b;
        }
        #simulator .amt {
          font-size: 44px;
          font-weight: 800;
          letter-spacing: -.03em;
          line-height: 1.1;
          font-variant-numeric: tabular-nums;
          color: var(--ink);
        }
        #simulator .g .amt {
          color: #0a7a4b;
        }
        #simulator .amt small {
          font-size: 20px;
          font-weight: 500;
          letter-spacing: 0;
          color: var(--mute);
          margin-left: 8px;
        }
        #simulator .g .amt small {
          color: #3b9b74;
        }
        #simulator .ic p {
          margin: 10px 0 0;
          font-size: 14px;
          color: var(--mute);
          line-height: 1.45;
        }
        #simulator .g p {
          color: #3d5f52;
        }
        #simulator .x5 {
          display: flex;
          gap: 4px;
          margin-top: 16px;
        }
        #simulator .x5 i {
          flex: 1;
          height: 8px;
          border-radius: 4px;
          background: #c9f0dc;
          transform-origin: left;
          transform: scaleX(.3);
          opacity: .5;
          transition: all .5s cubic-bezier(.3,1.4,.5,1);
        }
        #simulator .x5 i:first-child {
          background: var(--ink);
        }
        #simulator .x5.on i {
          transform: none;
          opacity: 1;
        }
        #simulator .x5.on i:nth-child(2) {
          background: #7fdcae;
          transition-delay: .15s;
        }
        #simulator .x5.on i:nth-child(3) {
          background: #45c98b;
          transition-delay: .3s;
        }
        #simulator .x5.on i:nth-child(4) {
          background: #1fb672;
          transition-delay: .45s;
        }
        #simulator .x5.on i:nth-child(5) {
          background: #0a7a4b;
          transition-delay: .6s;
        }
        #simulator .note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
          font-size: 14px;
          color: var(--mute);
          text-align: center;
        }
        #simulator .note svg {
          flex: none;
          color: var(--blue);
        }
        #simulator .cta {
          display: flex;
          width: max-content;
          max-width: 100%;
          align-items: center;
          gap: 10px;
          margin: 22px auto 0;
          padding: 18px 42px;
          border: 0;
          border-radius: 999px;
          background: var(--blue);
          color: #fff;
          font: inherit;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 14px 34px -8px rgba(26,92,255,.55);
          transition: transform .2s, box-shadow .2s;
          text-decoration: none;
        }
        #simulator .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px -8px rgba(26,92,255,.7);
        }
        #simulator .cta svg {
          transition: transform .2s;
        }
        #simulator .cta:hover svg {
          transform: translateX(4px);
        }
        @media (max-width: 640px) {
          #simulator .info {
            grid-template-columns: 1fr;
          }
          #simulator .amt {
            font-size: 38px;
          }
          #simulator .cta {
            padding: 16px 26px;
            font-size: 15px;
          }
        }
        @media (max-width: 560px) {
          #simulator .card {
            padding: 20px 14px;
            border-radius: 20px;
          }
          #simulator .top {
            padding-bottom: 12px;
            margin-bottom: 14px;
            font-size: 10px;
          }
          #simulator h2 {
            font-size: 20px;
            margin-bottom: 4px;
          }
          #simulator .sub {
            font-size: 11px;
            margin-bottom: 14px;
          }
          #simulator .hero {
            margin-bottom: 6px;
          }
          #simulator .seat strong,
          #simulator .ret strong {
            font-size: 26px;
          }
          #simulator .chart {
            height: 90px;
            gap: 1.5px;
          }
          #simulator .axis {
            font-size: 9px;
            margin: 6px 0 8px;
          }
          #simulator input[type=range] {
            margin: 0 0 14px;
          }
          #simulator .split {
            height: 38px;
            border-radius: 12px;
          }
          #simulator .split div {
            font-size: 10px;
          }
          #simulator .legend {
            font-size: 9px;
            margin-top: 8px;
          }
          #simulator .math {
            margin-top: 12px;
            padding: 10px 12px;
            font-size: 11px;
            border-radius: 12px;
          }
          #simulator .info {
            margin-top: 18px;
            gap: 10px;
          }
          #simulator .ic {
            padding: 14px;
            border-radius: 16px;
          }
          #simulator .ico {
            width: 34px;
            height: 34px;
            border-radius: 10px;
            margin-bottom: 10px;
          }
          #simulator .amt {
            font-size: 24px;
          }
          #simulator .amt small {
            font-size: 13px;
          }
          #simulator .ic p {
            font-size: 11px;
            margin-top: 6px;
          }
          #simulator .note {
            margin-top: 16px;
            font-size: 11px;
          }
          #simulator .cta {
            padding: 12px 24px;
            font-size: 13px;
            margin-top: 14px;
          }
        }

        /* Responsive Layout: Single column on mobile & tablet (< 1024px), Divided into Two Sections on Large Screens & Laptops (>= 1024px) */
        #simulator .layout-split {
          display: block;
        }
        #simulator .sec-simulator {
          width: 100%;
          min-width: 0;
        }
        #simulator .sec-inflow {
          width: 100%;
          min-width: 0;
        }

        @media(min-width: 1024px) {
          #simulator .card {
            max-width: 1240px;
            padding: 44px 48px;
          }
          #simulator .layout-split {
            display: grid;
            grid-template-columns: 1.12fr 0.88fr;
            gap: 40px;
            align-items: center;
          }
          #simulator .sec-inflow {
            display: flex;
            flex-direction: column;
            justify-content: center;
            height: 100%;
            border-left: 1px solid var(--line);
            padding-left: 40px;
          }
          #simulator .sec-inflow .info {
            margin-top: 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
          }
          #simulator .sec-inflow .ic {
            padding: 22px 18px;
            border-radius: 20px;
          }
          #simulator .sec-inflow .ico {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            margin-bottom: 16px;
          }
          #simulator .sec-inflow .ic h4 {
            font-size: 11px;
            margin-bottom: 4px;
          }
          #simulator .sec-inflow .amt {
            font-size: 34px;
          }
          #simulator .sec-inflow .amt small {
            font-size: 15px;
            margin-left: 4px;
          }
          #simulator .sec-inflow .ic p {
            font-size: 12.5px;
            line-height: 1.42;
            margin-top: 8px;
          }
          #simulator .sec-inflow .x5 {
            margin-top: 12px;
            gap: 3px;
          }
          #simulator .sec-inflow .x5 i {
            height: 6px;
          }
          #simulator .sec-inflow .note {
            margin-top: 24px;
            font-size: 13px;
          }
          #simulator .sec-inflow .cta {
            margin-top: 20px;
            padding: 16px 32px;
            font-size: 15px;
          }
        }

        @media(min-width: 1280px) {
          #simulator .card {
            max-width: 1300px;
            padding: 48px 54px;
          }
          #simulator .layout-split {
            gap: 48px;
          }
          #simulator .sec-inflow {
            padding-left: 48px;
          }
          #simulator .sec-inflow .info {
            gap: 16px;
          }
          #simulator .sec-inflow .ic {
            padding: 26px 22px;
            border-radius: 22px;
          }
          #simulator .sec-inflow .ico {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            margin-bottom: 20px;
          }
          #simulator .sec-inflow .ic h4 {
            font-size: 12px;
            margin-bottom: 6px;
          }
          #simulator .sec-inflow .amt {
            font-size: 40px;
          }
          #simulator .sec-inflow .amt small {
            font-size: 18px;
            margin-left: 6px;
          }
          #simulator .sec-inflow .ic p {
            font-size: 13.5px;
          }
          #simulator .sec-inflow .x5 {
            margin-top: 14px;
            gap: 4px;
          }
          #simulator .sec-inflow .x5 i {
            height: 7px;
          }
          #simulator .sec-inflow .note {
            margin-top: 28px;
            font-size: 14px;
          }
          #simulator .sec-inflow .cta {
            margin-top: 22px;
            padding: 18px 38px;
            font-size: 16px;
          }
        }
      ` }} />

      <section className="card" id="sec" ref={secRef}>
        <div className="layout-split">
          {/* Section 1: Interactive Seat Benefit Simulator */}
          <div className="sec-simulator">
            <div className="top">
              <span><i></i>Seat benefit example</span>
              <span className="r"><i></i>Your seat: #<b id="n2">{seat}</b></span>
            </div>

            <h2>Earlier seat. <em>Bigger return.</em></h2>
            <p className="sub">Every seat is <b>$300</b>. Your seat number decides how much comes back to you.</p>

            <div className="hero">
              <div className="seat">Your seat<strong>#<span id="n">{seat}</span></strong></div>
              <div className="ret">Back to you<strong id="v">{f(back)}</strong></div>
            </div>

            <div
              className="chart"
              id="chart"
              ref={chartRef}
              aria-hidden="true"
              onPointerDown={onChartPointerDown}
              onPointerMove={onChartPointerMove}
              onPointerUp={onChartPointerUp}
              onPointerCancel={onChartPointerUp}
            >
              {Array.from({ length: 100 }, (_, i) => {
                const seatNum = i + 1;
                const isSelected = seatNum === seat;
                const isEarlier = seatNum < seat;
                const barClass = `b${isEarlier ? ' e' : ''}${isSelected ? ' s' : ''}`;
                const barHeight = `${300 / seatNum / 3}%`;
                return (
                  <div
                    key={seatNum}
                    className={barClass}
                    style={{ height: barHeight }}
                  />
                );
              })}
            </div>
            <div className="axis"><span>Seat 1</span><span>Seat 100</span></div>
            <input
              type="range"
              id="r"
              min="1"
              max="100"
              value={seat}
              onChange={(e) => {
                autoRef.current = false;
                setSeat(Number(e.target.value));
              }}
              aria-label="Choose seat number"
            />

            <div className="split">
              <div
                id="pe"
                style={{
                  width: `${100 - 100 / seat}%`,
                }}
              >
                {rest > 0 ? f(rest) : ''}
              </div>
              <div
                id="py"
                style={{
                  width: `${100 / seat}%`,
                }}
              >
                {seat <= 30 ? f(back) : ''}
              </div>
            </div>
            <div className="legend">
              <span><i style={{ background: 'var(--green)' }} />To earlier seats</span>
              <span><i style={{ background: 'var(--blue)' }} />Back to you</span>
            </div>

            <div className="math" id="m">
              {rest > 0 ? (
                <>
                  $300 ÷ <b>{seat}</b> = <b>{f(back)}</b> back to you · {f(rest)} to earlier seats
                </>
              ) : (
                <>
                  $300 ÷ <b>1</b> = <b>$300</b> back to you
                </>
              )}
            </div>

            <div className="chips" id="chips">
              {[1, 2, 10, 50, 100].map((k) => (
                <button
                  key={k}
                  type="button"
                  className={seat === k ? 'active' : ''}
                  onClick={() => {
                    autoRef.current = false;
                    setSeat(k);
                  }}
                >
                  Seat {k}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Deposit Contribution, Max Inflow Cap & CTA */}
          <div className="sec-inflow">
            <div className="info">
              <div className="ic">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <h4>Deposit contribution</h4>
                <div className="amt">$300<small>USD</small></div>
                <p>Uniform protocol entry contribution across all Genesis seats.</p>
              </div>

              <div className="ic g">
                <div className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 7l-8.5 8.5-5-5L2 17" />
                    <path d="M16 7h6v6" />
                  </svg>
                </div>
                <h4>Max inflow (cap)</h4>
                <div className="amt">$<span id="cap" ref={capRef}>1,500</span><small>USD</small></div>
                <div className="x5" id="x5" ref={x5Ref}>
                  <i></i><i></i><i></i><i></i><i></i>
                </div>
                <p>500% baseline earnings cap on initial deposit with continuous dividend distributions.</p>
              </div>
            </div>

            <div className="note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              Council seats are allocated sequentially by the smart contract upon deposit.
            </div>

            <Link href="/dao" className="cta">
              Join Genesis Council ($300 Entry)
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
};
