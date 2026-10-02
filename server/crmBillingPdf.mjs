import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { readFile } from 'node:fs/promises';
const ink = rgb(0.08, 0.18, 0.25),
  blue = rgb(0.03, 0.43, 0.55),
  grey = rgb(0.39, 0.46, 0.5),
  line = rgb(0.86, 0.9, 0.92),
  soft = rgb(0.94, 0.97, 0.98);
const names = {
  facture: 'Facture',
  acompte: 'Facture d’acompte',
  solde: 'Facture de solde',
  avoir: 'Avoir',
};
export async function generateBillingPdf(record, { preview = false } = {}) {
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
    fields = {
      companyName: record.company.name,
      companyAddress: record.company.address,
      companyPhone: record.company.phone,
      companyEmail: record.company.email,
      companySiret: record.company.siret,
      companyVat: record.company.vat,
    };
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
      preview
        ? 'APERÇU - NON ÉMIS - SANS VALEUR COMPTABLE'
        : 'WE MOVE - ' + names[record.kind].toUpperCase(),
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
    right(
      preview ? 'Vérification avant émission' : 'Original archivé',
      555,
      90,
      9,
      regular,
      grey,
    );
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
    preview
      ? 'Aucun numéro définitif n’est attribué à cet aperçu.'
      : record.kind === 'avoir'
        ? 'Rectification de la facture ' + record.creditNumber
        : 'Prestations de déménagement',
    { size: 9, color: grey },
  );
  y += 14;
  const issuer = [
    ['ÉMETTEUR', 11, bold, blue],
    [fields.companyName || 'Société à compléter', 11, bold],
    [fields.companyAddress || 'Adresse à compléter', 9],
    [
      record.company.legalForm +
        ' · Capital : ' +
        record.company.capital +
        ' €',
      8,
    ],
    ['SIRET : ' + fields.companySiret, 8],
    ['TVA : ' + fields.companyVat, 8],
    ['RCS : ' + record.company.registration, 8],
    [[fields.companyPhone, fields.companyEmail].filter(Boolean).join(' · '), 9],
  ];
  const client = [
    ['CLIENT', 11, bold, blue],
    [source.clientName, 11, bold],
    [source.clientAddress, 9],
    [source.clientEmail || '', 9],
  ];
  if (record.details.clientSiren)
    client.push(['SIREN : ' + record.details.clientSiren, 9]);
  if (record.details.clientVat)
    client.push(['TVA : ' + record.details.clientVat, 9]);
  if (record.details.orderNumber)
    client.push(['Bon de commande : ' + record.details.orderNumber, 9]);
  if (record.details.deliveryAddress)
    client.push([
      'Adresse de prestation : ' + record.details.deliveryAddress,
      9,
    ]);
  const blockHeight = (rows) =>
    rows.reduce(
      (n, [v, size, font = regular]) =>
        n + wrap(v, 240, size, font).length * (size + 5) + 3,
      0,
    );
  const h = Math.max(blockHeight(issuer), blockHeight(client));
  if (h < 420) {
    ensure(h + 20);
    const top = y;
    for (const [rows, x] of [
      [issuer, 40],
      [client, 315],
    ]) {
      y = top;
      for (const [v, size, font = regular, color = ink] of rows) {
        text(v, { size, font, color, width: 240, x });
        y += 3;
      }
    }
    y = top + h + 16;
  } else {
    for (const rows of [issuer, client])
      for (const [v, size, font = regular, color = ink] of rows) {
        text(v, { size, font, color });
        y += 3;
      }
    y += 12;
  }
  text(
    'Devis source : ' +
      source.quoteReference +
      ' · version ' +
      source.quoteRevision,
    { size: 9, color: grey },
  );
  text('Échéance : ' + date(record.dueDate), {
    size: 9,
    color: grey,
  });
  text(
    (record.kind === 'acompte'
      ? 'Date du versement : '
      : 'Date de prestation : ') + date(record.details.serviceDate),
    { size: 9, color: grey },
  );
  heading('PRESTATIONS · TVA ' + record.taxRate + ' %');
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
                ? `Acompte de ${record.depositRate} % sur les prestations du devis ${source.quoteReference}`
                : record.kind === 'avoir'
                  ? 'Avoir sur la facture ' +
                    record.creditNumber +
                    ' : ' +
                    record.reason
                  : `Solde des prestations du devis ${source.quoteReference}, après l’acompte ${record.depositNumber}`,
            quantity: 1,
            unitPriceHT: record.amountHT / 100,
            total: record.amountHT,
          },
        ];
  for (const item of items) {
    const lines = wrap(item.description, 320, 9);
    if (lines.length * 14 + 21 < 560 && y + lines.length * 14 + 21 > 755) {
      start();
      tableHeader();
    }
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
  draw(
    record.kind === 'avoir' ? 'TOTAL AVOIR TTC' : 'TOTAL TTC',
    312,
    y + 13,
    10,
    bold,
    rgb(1, 1, 1),
  );
  right(money(record.amountTTC), 542, y + 11, 14, bold, rgb(1, 1, 1));
  y += 57;
  text('Montant total du projet : ' + money(record.totalProjectTTC), {
    size: 9,
    color: grey,
  });
  if (record.kind === 'solde')
    text(
      'Acompte déjà facturé : ' +
        money(record.depositTTC) +
        ' (ne signifie pas qu’il est réglé).',
      { size: 9, color: grey },
    );
  if (source.notes) {
    heading('PRÉCISIONS');
    text(source.notes, { size: 9 });
  }
  heading(
    record.kind === 'avoir' ? 'RECTIFICATION' : 'CONDITIONS DE RÈGLEMENT',
  );
  if (record.kind === 'avoir')
    text(
      'Avoir relatif à la facture ' +
        record.creditNumber +
        '. Motif : ' +
        record.reason +
        '. Cet avoir ne vaut pas justificatif de remboursement.',
      { size: 9, color: grey },
    );
  else {
    text(record.terms.discount, { size: 9, color: grey });
    if (record.details.clientType === 'entreprise')
      text(
        'Pénalités de retard : ' +
          record.terms.latePenalty +
          '. Indemnité forfaitaire pour frais de recouvrement : 40 € en cas de retard de paiement.',
        { size: 9, color: grey },
      );
    if (record.company.iban)
      text(
        'Virement · IBAN : ' +
          record.company.iban +
          (record.company.bic ? ' · BIC : ' + record.company.bic : ''),
        { size: 9 },
      );
  }
  if (record.taxRate === 0)
    text(record.terms.exemption, { size: 9, color: grey });
  if (record.company.vatOnDebits)
    text('Option pour le paiement de la taxe d’après les débits.', {
      size: 9,
      color: grey,
    });
  if (record.company.insurance)
    text(record.company.insurance, { size: 8, color: grey });
  if (preview)
    text('APERÇU NON ÉMIS : ne pas transmettre comme facture.', {
      size: 10,
      font: bold,
      color: blue,
    });
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
      'WE MOVE · ' + record.number + (preview ? ' · NON ÉMIS' : ''),
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
  pdf.setSubject(
    preview ? 'Aperçu non émis' : 'Document de facturation WE MOVE',
  );
  pdf.setCreationDate(new Date(record.createdAt));
  pdf.setModificationDate(new Date(record.createdAt));
  return Buffer.from(await pdf.save());
}
