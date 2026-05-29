import { forwardRef } from 'react';
import {
  formatIssueDate,
  getBoard,
  statementOfRecognition,
  unitTitleFor,
} from '../lib/certificates';
import type { Animal, CertificateRecord } from '../types';

interface Props {
  record: CertificateRecord;
  ownerName: string;
  portraitUrl?: string;
  flavorLine?: string;
}

const FRAME_WIDTH = 1123;
const FRAME_HEIGHT = 794;

function breedShortName(breedDialect: string): string {
  return breedDialect.split(',')[0]?.trim() || breedDialect;
}

function personalityTerm(animal: Animal): string {
  return animal === 'dog' ? 'Dogsonality' : 'Catsonality';
}

export const Certificate = forwardRef<HTMLDivElement, Props>(
  function Certificate(
    { record, ownerName, portraitUrl, flavorLine },
    ref,
  ) {
    const board = getBoard(record.animal);
    const unitTitle = unitTitleFor(record.animal, record.unit);
    const resolvedFlavor = flavorLine ?? record.flavorLine;
    const breedShort = breedShortName(record.breedDialect);
    const term = personalityTerm(record.animal);

    return (
      <div
        ref={ref}
        className={`certificate ${record.animal === 'dog' ? 'cert-dog' : 'cert-cat'}`}
        style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
      >
        <div className="cert-bg" />
        <CornerFlourish position="tl" />
        <CornerFlourish position="tr" />
        <CornerFlourish position="bl" />
        <CornerFlourish position="br" />

        <div className="cert-inner">
          {/* ── TOP ─────────────────────────────── */}
          <div className="cert-top">
            <div className="cert-header">
              <div className="cert-board-acronym">{board.acronym}</div>
              <div className="cert-board-full">{board.fullName}</div>
            </div>
            <div className="cert-title">Certificate of Proficiency</div>
            <div className="cert-subtitle">In Interspecies Vocal Communication</div>
          </div>

          {/* ── CENTER ──────────────────────────── */}
          <div className="cert-center">
          <div className="cert-middle">
            <div className="cert-text-col">
              <div className="cert-presented">This is to certify that</div>
              <div className="cert-recipient-line">
                <span className="cert-recipient">{ownerName}</span>
              </div>
              <div className="cert-attainment">
                <span className="cert-have-attained">
                  has successfully demonstrated
                </span>
                <span className="cert-proficiency">{record.proficiencyLabel}</span>
                <span className="cert-have-attained">fluency in</span>
                <span className="cert-dialect">{record.breedDialect}</span>
              </div>
            </div>

            <div className="cert-portrait-col">
              <div className="cert-portrait-ring">
                {portraitUrl ? (
                  <img
                    src={portraitUrl}
                    alt={`${ownerName}'s ${term} portrait`}
                    crossOrigin="anonymous"
                    className="cert-portrait-img"
                  />
                ) : (
                  <div className="cert-portrait-placeholder">
                    <PortraitPawSVG animal={record.animal} />
                  </div>
                )}
              </div>
              <div className="cert-portrait-caption">
                <div className="cert-portrait-eyebrow">{term} Portrait</div>
                <div className="cert-portrait-sub">
                  A reflection of {ownerName}'s inner {breedShort}
                </div>
              </div>
            </div>
          </div>

            {resolvedFlavor && (
              <div className="cert-flavor-line">{resolvedFlavor}</div>
            )}
            <div className="cert-unit-line">
              following completion of <em>{unitTitle}</em> (Unit {record.unit})
            </div>
          </div>

          {/* ── BOTTOM ──────────────────────────── */}
          <div className="cert-bottom">
            <div className="cert-footer">
              <div className="cert-footer-col cert-footer-left">
                <div className="cert-signature">{board.examinerName}</div>
                <div className="cert-rule" />
                <div className="cert-examiner-title">{board.examinerTitle}</div>
              </div>
              <div className="cert-footer-col cert-footer-center">
                <Seal board={board.acronym} />
              </div>
              <div className="cert-footer-col cert-footer-right">
                <div className="cert-date">{formatIssueDate(record.issuedAt)}</div>
                <div className="cert-rule" />
                <div className="cert-examiner-title">Date of Examination</div>
              </div>
            </div>

            <div className="cert-statement">
              {statementOfRecognition(record.animal)}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

function CornerFlourish({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg
      className={`cert-corner cert-corner-${position}`}
      viewBox="0 0 120 120"
      width="120"
      height="120"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M10 10 L110 10 L110 110" opacity="0.35" />
        <path d="M14 14 L106 14 L106 106" opacity="0.6" />
        <path d="M18 22 C 30 22, 38 30, 38 42" />
        <path d="M22 18 C 22 30, 30 38, 42 38" />
        <circle cx="22" cy="22" r="2.5" fill="currentColor" />
        <path d="M52 18 C 60 22, 64 28, 62 36" />
        <path d="M18 52 C 22 60, 28 64, 36 62" />
      </g>
    </svg>
  );
}

function Seal({ board }: { board: 'ICCSB' | 'IFCSB' }) {
  const CX = 110;
  const CY = 110;
  // Gear-like scalloped teeth around the outer edge for an embossed-medal feel.
  const teeth = Array.from({ length: 48 }, (_, i) => {
    const angle = (i / 48) * Math.PI * 2;
    const inner = 96;
    const outer = 104;
    const x1 = CX + Math.cos(angle) * inner;
    const y1 = CY + Math.sin(angle) * inner;
    const x2 = CX + Math.cos(angle) * outer;
    const y2 = CY + Math.sin(angle) * outer;
    return { x1, y1, x2, y2, key: i };
  });

  return (
    <svg className="cert-seal" viewBox="0 0 220 220" width="150" height="150">
      <defs>
        <radialGradient id="sealGrad" cx="42%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#fdf2d6" />
          <stop offset="45%" stopColor="#e7c477" />
          <stop offset="100%" stopColor="#a9772f" />
        </radialGradient>
        <radialGradient id="sealCore" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#f7e2b0" />
          <stop offset="100%" stopColor="#cda155" />
        </radialGradient>
        <path id="sealCurveTop" d="M 32 110 A 78 78 0 0 1 188 110" fill="none" />
        <path id="sealCurveBot" d="M 32 110 A 78 78 0 0 0 188 110" fill="none" />
      </defs>

      {/* Ribbon tails */}
      <g>
        <path d="M86 168 L70 214 L92 200 L104 176 Z" fill="#9a6b22" />
        <path d="M134 168 L150 214 L128 200 L116 176 Z" fill="#7a5320" />
      </g>

      {/* Scalloped / gear edge */}
      <g stroke="#8a5e22" strokeWidth="6" strokeLinecap="round">
        {teeth.map((t) => (
          <line key={t.key} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        ))}
      </g>

      {/* Medal body */}
      <circle cx={CX} cy={CY} r="98" fill="url(#sealGrad)" stroke="#7a5320" strokeWidth="2" />
      <circle cx={CX} cy={CY} r="88" fill="none" stroke="#fff7e2" strokeWidth="1.5" opacity="0.6" />
      <circle cx={CX} cy={CY} r="84" fill="none" stroke="#7a5320" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r="62" fill="url(#sealCore)" stroke="#8a5e22" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r="56" fill="none" stroke="#7a5320" strokeWidth="0.8" strokeDasharray="1.5 4" />

      {/* Center pawprint */}
      <g transform="translate(110,108)" fill="#43280f">
        <ellipse cx="0" cy="13" rx="16" ry="12.5" />
        <ellipse cx="-19" cy="-3" rx="6.5" ry="8.5" />
        <ellipse cx="19" cy="-3" rx="6.5" ry="8.5" />
        <ellipse cx="-9" cy="-18" rx="5.5" ry="7.5" />
        <ellipse cx="9" cy="-18" rx="5.5" ry="7.5" />
      </g>

      {/* Stars flanking the paw */}
      <g fill="#7a5320">
        <Star cx={48} cy={110} r={5} />
        <Star cx={172} cy={110} r={5} />
      </g>

      {/* Curved text */}
      <text fill="#43280f" fontSize="13" fontFamily="'Cormorant Garamond', serif" fontWeight="700" letterSpacing="2.5" textAnchor="middle">
        <textPath href="#sealCurveTop" startOffset="50%">{board} · OFFICIAL SEAL</textPath>
      </text>
      <text fill="#43280f" fontSize="12" fontFamily="'Cormorant Garamond', serif" fontWeight="700" letterSpacing="2.5" textAnchor="middle">
        <textPath href="#sealCurveBot" startOffset="50%">★ CERTIFIED FLUENT ★</textPath>
      </text>
    </svg>
  );
}

function Star({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(' ');
  return <polygon points={pts} />;
}

function PortraitPawSVG({ animal }: { animal: Animal }) {
  return (
    <svg viewBox="0 0 100 100" width="80" height="80">
      <g fill="currentColor" opacity="0.4">
        <ellipse cx="50" cy="62" rx="22" ry="18" />
        <ellipse cx="22" cy="42" rx="9" ry="12" />
        <ellipse cx="78" cy="42" rx="9" ry="12" />
        <ellipse cx="36" cy="22" rx="8" ry="11" />
        <ellipse cx="64" cy="22" rx="8" ry="11" />
      </g>
      <text x="50" y="92" fontSize="8" textAnchor="middle" fill="currentColor" opacity="0.5">
        {animal.toUpperCase()}
      </text>
    </svg>
  );
}
