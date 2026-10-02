import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
const ink = rgb(0.08, 0.18, 0.25),
  blue = rgb(0.03, 0.43, 0.55),
  grey = rgb(0.39, 0.46, 0.5),
  line = rgb(0.86, 0.9, 0.92),
  soft = rgb(0.94, 0.97, 0.98);
const names = {
  facture: 'Facture de test',
  acompte: 'Acompte de test',
  solde: 'Solde de test',
};
export async function generateTestBillingPdf(record) {
  const pdf = await PDFDocument.create(),
    regular = await pdf.embedFont(StandardFonts.Helvetica),
    bold = await pdf.embedFont(StandardFonts.HelveticaBold),
    italic = await pdf.embedFont(StandardFonts.TimesRomanItalic);
  const logo = await pdf.embedPng(
    await readFile(
      new URL('../public/images/we-move-logo-email.png', import.meta.url),
    ),
  );
  const source = record.snapshot,
    fields = source.sourceDocument?.fields || {};
  const clean = (s) =>
    Array.from(String(s ?? '').replace(/[\u00a0\u202f]/g, ' '))
      .map((c) => {
        if (c === '\n') return c;
        try {
          regular.encodeText(c);
          return c;
        } catch {
          return '?';
        }
      })
      .join('');
  const wrap = (value, width, size = 10, font = regular) => {
    const lines = [];
    for (const paragraph of clean(value).split('\n')) {
      let row = '';
      for (const word of paragraph.split(/\s+/)) {
        if (
          font.widthOfTextAtSize(row + (row ? ' ' : '') + word, size) <= width
        )
          row += (row ? ' ' : '') + word;
        else {
          if (row) lines.push(row);
          row = '';
          for (const char of word) {
            if (font.widthOfTextAtSize(row + char, size) > width) {
              lines.push(row);
              row = '';
            }
            row += char;
          }
        }
      }
      lines.push(row);
    }
    return lines;
  };
  const money = (c) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(c / 100);
  const date = (s) => (s ? s.split('-').reverse().join('/') : 'À convenir');
  let page, y;
  const draw = (value, x, top, size = 10, font = regular, color = ink) =>
    page.drawText(clean(value), { x, y: 842 - top - size, font, size, color });
  const right = (value, x, top, size = 10, font = regular, color = ink) =>
    draw(
      value,
      x - font.widthOfTextAtSize(clean(value), size),
      top,
      size,
      font,
      color,
    );
  const start = () => {
    page = pdf.addPage([595, 842]);
    page.drawRectangle({ x: 0, y: 817, width: 595, height: 25, color: blue });
    draw(
      'TEST - SANS VALEUR COMPTABLE - NE PAS ENVOYER AU CLIENT',
      40,
      7,
      8,
      bold,
      rgb(1, 1, 1),
    );
    const dimensions = logo.scaleToFit(142, 50);
    page.drawImage(logo, {
      x: 40,
      y: 842 - 45 - dimensions.height,
      width: dimensions.width,
      height: dimensions.height,
    });
    draw('Notre Passion : L’Excellence', 40, 102, 10, italic, blue);
    right(record.number, 555, 52, 12, bold);
    right('Établi le ' + date(record.issueDate), 555, 73, 9, regular, grey);
    right('Session de test ' + record.session, 555, 90, 9, regular, grey);
    page.drawLine({
      start: { x: 40, y: 710 },
      end: { x: 555, y: 710 },
      thickness: 0.6,
      color: line,
    });
    y = 148;
  };
  const ensure = (h) => {
    if (y + h > 755) start();
  };
  const text = (
    value,
    { size = 10, font = regular, color = ink, width = 515, x = 40 } = {},
  ) => {
    for (const row of wrap(value, width, size, font)) {
      ensure(size + 6);
      draw(row, x, y, size, font, color);
      y += size + 5;
    }
  };
  const heading = (value) => {
    ensure(42);
    y += 10;
    text(value, { font: bold, size: 11, color: blue });
    y += 5;
  };
  start();
  text(names[record.kind], { size: 25, font: bold });
  y += 7;
  text(
    'Simulation interne uniquement. Aucun paiement réel n’est constaté par ce document.',
    { size: 9, color: grey },
  );
  y += 14;
  heading('ÉMETTEUR');
  text(fields.companyName || 'WE MOVE', { font: bold });
  text(fields.companyAddress || 'Adresse à compléter', { size: 9 });
  text([fields.companyPhone, fields.companyEmail].filter(Boolean).join(' · '), {
    size: 9,
    color: grey,
  });
  text(
    'SIRET : ' +
      (fields.companySiret || 'à compléter') +
      ' · TVA : ' +
      (fields.companyVat || 'à compléter'),
    { size: 8, color: grey },
  );
  heading('CLIENT');
  text(source.clientName, { font: bold, size: 12 });
  text(source.clientAddress);
  if (source.clientEmail) text(source.clientEmail, { size: 9, color: grey });
  y += 10;
  text(
    'Devis source : ' +
      source.quoteReference +
      ' · version ' +
      source.quoteRevision,
    { size: 9, color: grey },
  );
  text('Échéance de simulation : ' + date(record.dueDate), {
    size: 9,
    color: grey,
  });
  heading('PRESTATIONS');
  const tableHeader = () => {
    ensure(35);
    page.drawRectangle({
      x: 40,
      y: 842 - y - 25,
      width: 515,
      height: 25,
      color: soft,
    });
    draw('DÉSIGNATION', 50, y + 8, 8, bold, blue);
    right('QTÉ', 399, y + 8, 8, bold, blue);
    right('P.U. HT', 471, y + 8, 8, bold, blue);
    right('TOTAL HT', 545, y + 8, 8, bold, blue);
    y += 34;
  };
  tableHeader();
  const items =
    record.kind === 'facture'
      ? source.items.map((i) => ({
          ...i,
          total: Math.round(i.quantity * i.unitPriceHT * 100),
        }))
      : [
          {
            description:
              record.kind === 'acompte'
                ? `Acompte simulé de ${record.depositRate} % sur les prestations du devis ${source.quoteReference}`
                : `Solde simulé des prestations du devis ${source.quoteReference}, après l’acompte ${record.depositNumber}`,
            quantity: 1,
            unitPriceHT: record.amountHT / 100,
            total: record.amountHT,
          },
        ];
  for (const item of items) {
    const lines = wrap(item.description, 320, 9);
    for (let n = 0; n < lines.length; n++) {
      if (y + 20 > 755) {
        start();
        tableHeader();
      }
      draw(lines[n], 50, y, 9);
      if (n === 0) {
        right(String(item.quantity), 399, y, 9);
        right(money(Math.round(item.unitPriceHT * 100)), 471, y, 9);
        right(money(item.total), 545, y, 9);
      }
      y += 14;
    }
    y += 9;
    page.drawLine({
      start: { x: 40, y: 842 - y },
      end: { x: 555, y: 842 - y },
      thickness: 0.5,
      color: line,
    });
    y += 12;
  }
  ensure(148);
  y += 10;
  right('Total HT', 434, y, 10);
  right(money(record.amountHT), 545, y, 10, bold);
  y += 24;
  right('TVA (' + record.taxRate + ' %)', 434, y, 10);
  right(money(record.taxAmount), 545, y, 10, bold);
  y += 24;
  page.drawRectangle({
    x: 300,
    y: 842 - y - 40,
    width: 255,
    height: 40,
    color: blue,
  });
  draw('TOTAL TTC', 312, y + 13, 10, bold, rgb(1, 1, 1));
  right(money(record.amountTTC), 542, y + 11, 14, bold, rgb(1, 1, 1));
  y += 57;
  text('Montant total du projet : ' + money(record.totalProjectTTC), {
    size: 9,
    color: grey,
  });
  if (record.kind === 'solde')
    text(
      'Acompte déjà simulé : ' +
        money(record.depositTTC) +
        ' (ne signifie pas qu’il est réglé).',
      { size: 9, color: grey },
    );
  if (source.notes) {
    heading('PRÉCISIONS');
    text(source.notes, { size: 9 });
  }
  heading('DOCUMENT D’ESSAI');
  text(
    'Ce PDF sert à vérifier votre parcours de facturation. Il ne constitue ni une facture émise, ni un justificatif de règlement. Les règlements simulés sont suivis séparément dans le CRM.',
    { size: 9, color: grey },
  );
  const pages = pdf.getPages();
  for (let i = 0; i < pages.length; i++) {
    page = pages[i];
    page.drawLine({
      start: { x: 40, y: 65 },
      end: { x: 555, y: 65 },
      thickness: 0.6,
      color: line,
    });
    draw(
      'WE MOVE · ' + record.number + ' · TEST SANS VALEUR COMPTABLE',
      40,
      790,
      8,
      bold,
      grey,
    );
    right(`${i + 1} / ${pages.length}`, 555, 790, 8, regular, grey);
  }
  pdf.setTitle(names[record.kind] + ' - ' + record.number);
  pdf.setAuthor('WE MOVE');
  pdf.setSubject('Simulation interne - sans valeur comptable');
  pdf.setCreationDate(new Date(record.createdAt));
  pdf.setModificationDate(new Date(record.createdAt));
  return Buffer.from(await pdf.save());
}
