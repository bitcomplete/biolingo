export async function exportCertificateToPDF(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // Walk up and temporarily clear any transforms / overflow:hidden so html2canvas
  // captures the certificate at its natural 1123x794 dimensions regardless of the
  // scaled preview wrapper around it.
  type Saved = { el: HTMLElement; transform: string; overflow: string };
  const saved: Saved[] = [];
  let node: HTMLElement | null = element.parentElement;
  while (node) {
    saved.push({
      el: node,
      transform: node.style.transform,
      overflow: node.style.overflow,
    });
    node.style.transform = 'none';
    if (getComputedStyle(node).overflow !== 'visible') {
      node.style.overflow = 'visible';
    }
    node = node.parentElement;
  }

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.offsetWidth,
      windowHeight: element.offsetHeight,
    });
  } finally {
    for (const s of saved) {
      s.el.style.transform = s.transform;
      s.el.style.overflow = s.overflow;
    }
  }

  const imgData = canvas.toDataURL('image/png');

  const pdfWidth = 297;
  const pdfHeight = 210;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const canvasAspect = canvas.width / canvas.height;
  const pageAspect = pdfWidth / pdfHeight;

  let renderW = pdfWidth;
  let renderH = pdfHeight;
  if (canvasAspect > pageAspect) {
    renderH = pdfWidth / canvasAspect;
  } else {
    renderW = pdfHeight * canvasAspect;
  }
  const offsetX = (pdfWidth - renderW) / 2;
  const offsetY = (pdfHeight - renderH) / 2;

  doc.addImage(imgData, 'PNG', offsetX, offsetY, renderW, renderH);
  doc.save(filename);
}
