import { useEffect, useRef, useState } from 'react';
import { Certificate } from './Certificate';
import { Confetti } from './Confetti';
import {
  linkedInCaption,
  unitTitleFor,
  updateCertificateCopy,
} from '../lib/certificates';
import { generatePetPortrait } from '../lib/imageGen';
import { getPrefetched } from '../lib/portraitPrefetch';
import { exportCertificateToPDF } from '../lib/pdfExport';
import { loadProgress, saveProgress } from '../lib/progress';
import type { CertificateRecord, UserProgress } from '../types';

interface Props {
  open: boolean;
  record: CertificateRecord;
  progress: UserProgress;
  celebrate?: boolean;
  onClose: () => void;
  onProgressChange: (next: UserProgress) => void;
}

type GenStatus = 'idle' | 'loading' | 'done' | 'error';

export function CertificateModal({
  open,
  record,
  progress,
  celebrate = false,
  onClose,
  onProgressChange,
}: Props) {
  const certRef = useRef<HTMLDivElement | null>(null);
  const [portrait, setPortrait] = useState<string | undefined>(record.imageDataUrl);
  const [flavorLine, setFlavorLine] = useState<string | undefined>(record.flavorLine);
  const [genStatus, setGenStatus] = useState<GenStatus>(record.imageDataUrl ? 'done' : 'idle');
  const [genError, setGenError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const autoGenKeyRef = useRef<string | null>(null);

  const ownerName = progress.ownerName || 'The Student';

  const applyResult = (result: Awaited<ReturnType<typeof generatePetPortrait>>) => {
    setPortrait(result.dataUrl);
    setFlavorLine(result.flavorLine);
    if (result.error) {
      setGenError(result.error);
      setGenStatus('error');
    } else {
      setGenStatus('done');
    }
    if (!result.fromFallback) {
      const fresh = loadProgress();
      const next = updateCertificateCopy(fresh, record.key, {
        imageDataUrl: result.dataUrl,
        flavorLine: result.flavorLine,
      });
      saveProgress(next);
      onProgressChange(next);
    }
  };

  const generatePortrait = async () => {
    setGenStatus('loading');
    setGenError(null);
    const profile = progress.personalityProfile?.[record.animal];
    const result = await generatePetPortrait({
      animal: record.animal,
      profile,
      proficiencyLabel: record.proficiencyLabel,
      ownerName,
      record,
    });
    applyResult(result);
  };

  useEffect(() => {
    if (!open) return;
    setPortrait(record.imageDataUrl);
    setFlavorLine(record.flavorLine);
    setGenStatus(record.imageDataUrl ? 'done' : 'idle');
    setGenError(null);

    // Auto-generate the portrait if the certificate doesn't have one yet.
    // Prefer a background-prefetched result when available.
    if (!record.imageDataUrl && autoGenKeyRef.current !== record.key) {
      autoGenKeyRef.current = record.key;
      const prefetched = getPrefetched(record.animal, record.unit);
      if (prefetched) {
        setGenStatus('loading');
        setGenError(null);
        void prefetched.promise.then(applyResult);
      } else {
        void generatePortrait();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, record.imageDataUrl, record.flavorLine, record.key]);

  useEffect(() => {
    if (open && celebrate) {
      setConfettiBurst((b) => b + 1);
    }
  }, [open, celebrate]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  if (!open) return null;

  const certCount = Object.keys(progress.certificates ?? {}).length;
  const isFirstCertificate = celebrate && certCount <= 1;
  const congratsHeadline = isFirstCertificate
    ? 'Congratulations! You earned your first certificate'
    : 'Congratulations! Certificate earned';

  const handleDownloadPDF = async () => {
    if (!certRef.current || pdfBusy) return;
    setPdfBusy(true);
    try {
      const filename = `barkback-certificate-${record.animal}-unit-${record.unit}.pdf`;
      await exportCertificateToPDF(certRef.current, filename);
      setToast('Certificate downloaded.');
    } catch (err) {
      console.error('[pdf export]', err);
      setToast('PDF export failed. Try again.');
    } finally {
      setPdfBusy(false);
    }
  };

  const handleLinkedInShare = async () => {
    const caption = linkedInCaption(record);
    // Keep the caption on the clipboard as a fallback in case LinkedIn drops
    // the prefilled text (e.g. when the user isn't logged in).
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // ignore clipboard rejection
    }
    if (certRef.current && !pdfBusy) {
      void handleDownloadPDF();
    }
    // LinkedIn's feed share composer prepopulates the post body via `text`.
    // (The older share-offsite endpoint only accepts a URL and ignores text.)
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
      caption,
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setToast('LinkedIn post pre-filled. Attach the downloaded PDF before sharing.');
  };

  return (
    <div className="cert-modal" role="dialog" aria-modal="true">
      <div className="cert-modal-inner">
        <div className="cert-modal-header">
          <div>
            <div className="cert-modal-eyebrow">
              {record.animal === 'dog' ? 'ICCSB' : 'IFCSB'} · {record.proficiencyLabel}
            </div>
            <h2 className="cert-modal-title">{congratsHeadline}</h2>
            <p className="cert-modal-sub">
              You just earned the {unitTitleFor(record.animal, record.unit)} certificate.
              {genStatus === 'loading'
                ? ' Conjuring your portrait…'
                : ' Download the PDF or share it to LinkedIn.'}
            </p>
          </div>
          <button className="cert-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="cert-preview-wrap">
          {portrait ? (
            <div className="cert-preview-scale">
              <Certificate
                ref={certRef}
                record={record}
                ownerName={ownerName}
                portraitUrl={portrait}
                flavorLine={flavorLine}
              />
            </div>
          ) : (
            <div className="cert-loading">
              <div className="cert-loading-spinner" aria-hidden="true" />
              <div className="cert-loading-text">
                Painting {ownerName}'s one-of-a-kind portrait…
              </div>
              <div className="cert-loading-sub">This can take a moment.</div>
            </div>
          )}
        </div>

        {genError && (
          <div className="cert-modal-warn">
            {genError}
          </div>
        )}

        <div className="cert-modal-actions">
          <button
            className="cert-btn cert-btn-secondary"
            onClick={generatePortrait}
            disabled={genStatus === 'loading'}
          >
            {genStatus === 'loading'
              ? 'Generating portrait…'
              : portrait
              ? 'Regenerate portrait'
              : 'Generate portrait'}
          </button>
          <button
            className="cert-btn cert-btn-secondary"
            onClick={handleDownloadPDF}
            disabled={pdfBusy || !portrait}
          >
            {pdfBusy ? 'Exporting…' : 'Download PDF'}
          </button>
          <button
            className="cert-btn cert-btn-primary"
            onClick={handleLinkedInShare}
            disabled={pdfBusy || !portrait}
          >
            Share to LinkedIn
          </button>
        </div>

        {toast && <div className="cert-toast">{toast}</div>}
      </div>

      <Confetti burstId={confettiBurst} animal={record.animal} />
    </div>
  );
}
