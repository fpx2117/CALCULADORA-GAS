import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FormData, ResultadosCalculos } from '../types';

export function generarPDF(formData: FormData, resultados: ResultadosCalculos): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const { datosGenerales } = formData;
  const edificio = resultados.edificio;
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm for A4
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  const splitLine = (text: string, fontSize = 8) => {
    doc.setFontSize(fontSize);
    return doc.splitTextToSize(text, contentWidth - 4);
  };

  const drawWrappedLine = (
    text: string,
    startY: number,
    options: { font?: 'normal' | 'bold'; fontSize?: number; color?: [number, number, number] } = {}
  ) => {
    const lines = splitLine(text, options.fontSize ?? 8);
    doc.setFont('helvetica', options.font ?? 'normal');
    doc.setFontSize(options.fontSize ?? 8);
    doc.setTextColor(...(options.color ?? [0, 0, 0]));
    doc.text(lines, margin + 2, startY);
    doc.setTextColor(0, 0, 0);
    return startY + lines.length * ((options.fontSize ?? 8) <= 8 ? 4 : 4.5);
  };

  if (edificio) {
    const flowUnit = datosGenerales.tipoGas === 'natural' ? 'm³/h' : 'kg/h';

    doc.setFillColor(29, 78, 216);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('PLANILLA ORIENTATIVA DE EDIFICIO / PH', pageWidth / 2, 11, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Instalador: ${datosGenerales.nombreInstalador} | Mat: ${datosGenerales.matricula}`,
      pageWidth / 2,
      18,
      { align: 'center' }
    );
    doc.text(`Dirección: ${datosGenerales.direccion}`, pageWidth / 2, 23.5, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    let y = 36;

    const ensurePageSpace = (requiredHeight: number) => {
      if (y + requiredHeight <= pageHeight - 16) return;
      doc.addPage();
      y = 18;
    };

    const addSectionTitle = (title: string) => {
      ensurePageSpace(14);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(29, 78, 216);
      doc.text(title, margin + 2, y + 4.5);
      doc.setTextColor(0, 0, 0);
      y += 10;
    };

    const summaryRows = [
      ['Tipo de gas', datosGenerales.tipoGas === 'natural' ? 'Gas Natural' : 'GLP'],
      ['Tipo de edificación', edificio.tipoEdificacion],
      ['Plantilla de unidad', edificio.plantillaNombre],
      ['Regulación', edificio.tipoRegulacion === 'colectivo' ? 'Colectiva' : 'Individual'],
      ['Total unidades', String(edificio.totalUnidades)],
      ['Factor simultaneidad', edificio.factorSimultaneidad.toFixed(2)],
      ['Caudal unitario', `${edificio.caudalUnitario.toFixed(2)} ${flowUnit}`],
      ['Caudal total con simultaneidad', `${edificio.caudalTotalSimultaneidad.toFixed(2)} ${flowUnit}`],
    ];

    autoTable(doc, {
      startY: y,
      body: summaryRows,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Unidades generadas por piso', margin, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [['Piso', 'Unidades', `Caudal por piso (${flowUnit})`, 'Artefactos']],
      body: [
        ...edificio.filas.map(fila => [
          fila.piso,
          fila.unidades.join(', '),
          fila.caudalPorPiso.toFixed(2),
          `${fila.artefactosPorUnidad} c/u`,
        ]),
        [
          'Total',
          `${edificio.totalUnidades} unidades`,
          edificio.caudalTotalSimultaneidad.toFixed(2),
          `con Sn=${edificio.factorSimultaneidad.toFixed(2)}`,
        ],
      ],
      theme: 'plain',
      headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 1.6 },
      margin: { left: margin, right: margin },
    });

    y = (doc as any).lastAutoTable.finalY + 8;
    doc.setFillColor(255, 248, 220);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Regulación de presión por altura', margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Altura total: ${edificio.alturaTotal.toFixed(2)} m`, margin + 3, y + 11);
    doc.text(`Pérdida por columna: -${edificio.perdidaColumna.toFixed(3)} mbar`, margin + 3, y + 16);
    doc.text(`Presión disponible por cañería: ${edificio.presionDisponible.toFixed(3)} mbar`, margin + 70, y + 11);
    doc.text(
      `Artefactos por unidad: ${edificio.plantillaArtefactos.join(', ')}`,
      margin + 70,
      y + 16
    );

    y += 32;

    addSectionTitle('Ventilación del edificio');

    if (formData.ambientesVentilacion.length === 0) {
      y = drawWrappedLine(
        'No se cargaron ambientes de ventilación para esta estimación. Verificar ventilación permanente según NAG-200 Cap. 6 y fichas técnicas de los artefactos.',
        y,
        { fontSize: 8 }
      ) + 4;
    } else {
      autoTable(doc, {
        startY: y,
        body: [
          ['Potencia ventilada total:', `${resultados.ventilacion.consumoTotalKW.toFixed(2)} kW`],
          ['Área total requerida:', `${resultados.ventilacion.areaRequerida.toFixed(1)} cm²`],
          ['Rejillas inferiores totales:', `${resultados.ventilacion.areaRejillaInferior.toFixed(1)} cm²`],
          ['Rejillas superiores totales:', `${resultados.ventilacion.areaRejillaSuperior.toFixed(1)} cm²`],
          ['Cantidad orientativa de rejillas:', String(resultados.ventilacion.cantidadRejillas)],
          ['Ratio adoptado:', `${formData.ratioVentilacion} cm²/kW`],
        ],
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 1.8 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 68 } },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 7;

      autoTable(doc, {
        startY: y,
        head: [['Ambiente', 'Volumen', 'Potencia', 'Rejilla inf.', 'Rejilla sup.', 'Conducto', 'Criterio']],
        body: formData.ambientesVentilacion.map(ambiente => [
          ambiente.nombre,
          `${ambiente.volumen.toFixed(2)} m³`,
          `${ambiente.consumoEstimadoKW.toFixed(2)} kW`,
          `${ambiente.areaRejillaInferior.toFixed(0)} cm²`,
          `${ambiente.areaRejillaSuperior.toFixed(0)} cm²`,
          `Ø${ambiente.diametroConducto} mm`,
          ambiente.criterioCalculo,
        ]),
        theme: 'plain',
        headStyles: { fillColor: [29, 78, 216], textColor: [255, 255, 255], fontSize: 7.5 },
        styles: { fontSize: 7.5, cellPadding: 1.5 },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 24 },
          1: { cellWidth: 19 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 },
          5: { cellWidth: 16 },
          6: { cellWidth: 'auto' },
        },
      });
    }

    const nombreArchivo = `informe-edificio-${datosGenerales.direccion.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
    doc.save(nombreArchivo);
    return;
  }

  // ── Pre-calcular aviso legal ───────────────────────────────────────────
  const avisoTitleLineHeight = 4;
  const avisoBodyLineHeight = 3.8;
  const avisoParagraphGap = 2.2;
  const avisoPaddingX = 2.5;
  const avisoPaddingTop = 3.5;
  const avisoPaddingBottom = 4;
  const avisoMaxWidth = pageWidth - margin * 2 - avisoPaddingX * 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  const avisoTitle = doc.splitTextToSize('AVISO LEGAL', avisoMaxWidth);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const avisoBody = doc.splitTextToSize(
    'Esta planilla es una ayuda de calculo orientativa para profesionales habilitados. No constituye proyecto de instalacion de gas ni reemplaza planos, memoria de calculo o verificacion tecnica final. Servidos.ar no asume responsabilidad por danos, accidentes o sanciones derivadas del uso de esta herramienta. La revision y validacion final corresponde al profesional matriculado.',
    avisoMaxWidth
  );
  const avisoNormas = doc.splitTextToSize(
    'Normas: NAG-200 (2019), NAG-215, NAG-250, Ley 24.076, ENARGAS. Verificar versión vigente de normas antes de usar.',
    avisoMaxWidth
  );
  const avisoH =
    avisoPaddingTop +
    avisoTitle.length * avisoTitleLineHeight +
    avisoParagraphGap +
    avisoBody.length * avisoBodyLineHeight +
    avisoParagraphGap +
    avisoNormas.length * avisoBodyLineHeight +
    avisoPaddingBottom;
  const FOOTER_H   = 8;
  const CONTENT_BOTTOM = 262;
  const AVISO_BOTTOM = pageHeight - FOOTER_H - 2;

  let currentPage = 1;
  const breakThreshold = () => CONTENT_BOTTOM;

  const drawTextLines = (lines: string[], x: number, startY: number, lineHeight: number) => {
    let cursorY = startY;

    for (const line of lines) {
      doc.text(line, x, cursorY);
      cursorY += lineHeight;
    }

    return cursorY;
  };

  // Helper para dibujar el bloque de aviso legal
  const drawAviso = (startY: number) => {
    doc.setFillColor(255, 240, 240);
    doc.rect(margin, startY, pageWidth - margin * 2, avisoH, 'F');
    doc.setTextColor(150, 0, 0);

    let textY = startY + avisoPaddingTop;
    const textX = margin + avisoPaddingX;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    textY = drawTextLines(avisoTitle, textX, textY, avisoTitleLineHeight);

    textY += avisoParagraphGap;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    textY = drawTextLines(avisoBody, textX, textY, avisoBodyLineHeight);

    textY += avisoParagraphGap;
    drawTextLines(avisoNormas, textX, textY, avisoBodyLineHeight);

    doc.setTextColor(0, 0, 0);
  };

  // ── Encabezado ──────────────────────────────────────────────────────────
  doc.setFillColor(29, 78, 216);
  doc.rect(0, 0, pageWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('Planilla tecnica de calculo de gas NAG-200 (Ley 24.076)', margin, 6.5);
  doc.setFontSize(6.6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date().toLocaleDateString('es-AR')}`, pageWidth - margin, 6.5, { align: 'right' });
  doc.text(
    `Instalador: ${datosGenerales.nombreInstalador} | Mat: ${datosGenerales.matricula}`,
    margin,
    11.5
  );
  doc.text(`Direccion: ${datosGenerales.direccion}`, margin, 15.5);

  doc.setTextColor(0, 0, 0);
  let y = 25;

  // Tipo de gas + caudales
  const tipoGasLabel = datosGenerales.tipoGas === 'natural'
    ? 'Gas Natural  |  Densidad relativa: 0.65  |  PC: 9.300 kcal/m³'
    : 'GLP  |  Densidad relativa: 1.52  |  PC: 11.000 kcal/kg';
  const consumoSinSim = formData.artefactosInstalados.reduce((s, a) => s + a.consumo * a.cantidad, 0);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`Tipo de Gas: ${tipoGasLabel}`, margin, y);
  y += 5;
  doc.text(
    `Caudal Total: ${consumoSinSim.toFixed(2)} m³/h  |  Con simultaneidad: ${resultados.consumoTotalConSimultaneidad.toFixed(2)} m³/h  (simplif. residencial: 2 mayores 100% + resto 50%)`,
    margin, y
  );
  y += 8;
  doc.setTextColor(0, 0, 0);

  // ── Sección helper ─────────────────────────────────────────────────────
  const sectionHeader = (title: string) => {
    if (y > breakThreshold()) {
      doc.addPage();
      currentPage++;
      y = 15;
    }
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, pageWidth - margin * 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(29, 78, 216);
    doc.text(title, margin + 2, y + 4.5);
    doc.setTextColor(0, 0, 0);
    y += 9;
  };

  // ── Artefactos ────────────────────────────────────────────────────────
  sectionHeader('Artefactos instalados (referencia NAG-200 Anexo E.1)');

  const artefactosRows = formData.artefactosInstalados.map((a, i) => {
    const kw = a.consumo * (datosGenerales.tipoGas === 'natural' ? 9300 : 11000) / 860;
    return [`${i + 1}. ${a.nombre}`, `${(a.consumo * a.cantidad).toFixed(2)} m³/h`, `${(kw * a.cantidad).toFixed(1)} kW`];
  });

  autoTable(doc, {
    startY: y,
    head: [['Artefacto', 'Consumo (m³/h)', 'Potencia (kW)']],
    body: [
      ...artefactosRows,
      [
        { content: 'TOTAL con simultaneidad (NAG-200)', colSpan: 1, styles: { fontStyle: 'bold' } },
        { content: `${resultados.consumoTotalConSimultaneidad.toFixed(2)} m³/h`, styles: { fontStyle: 'bold', textColor: [29, 78, 216] } },
        { content: `${resultados.ventilacion.consumoTotalKW.toFixed(1)} kW`, styles: { fontStyle: 'bold' } },
      ],
    ],
    theme: 'plain',
    headStyles: { fillColor: false as any, textColor: [50, 50, 50], fontStyle: 'bold', fontSize: 8, lineColor: [200, 200, 200], lineWidth: 0.1 },
    styles: { fontSize: 8, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: margin, right: margin },
  });
  y = (doc as any).lastAutoTable.finalY + 8;
  if ((doc as any).lastAutoTable.finalPage > currentPage) currentPage = (doc as any).lastAutoTable.finalPage;

  // ── Cálculo por tramos ────────────────────────────────────────────────
  sectionHeader('Cálculo de cañerías (Fórmula de Renouard — presupuesto 1 mbar por tramo)');

  for (const r of resultados.tramos) {
    if (y > breakThreshold()) { doc.addPage(); currentPage++; y = 15; }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${r.nombre}`, margin + 2, y);
    y += 5;

    y = drawWrappedLine(
      `L real: ${r.longitudReal.toFixed(1)} m  |  Le: ${r.longitudEquivalente.toFixed(1)} m  |  Q: ${r.caudal.toFixed(2)} m³/h`,
      y,
      { fontSize: 8, color: [60, 60, 60] }
    );

    const detalleMetodo =
      r.metodoLongitudEquivalente === 'factor_1_2'
        ? `Método Le: ${r.metodoLongitudEquivalenteLabel} (L real x 1.2; incremento ${r.longitudAccesorios.toFixed(1)} m)`
        : `Método Le: ${r.metodoLongitudEquivalenteLabel} (suma accesorios ${r.longitudAccesorios.toFixed(1)} m)`;
    y = drawWrappedLine(detalleMetodo, y, { fontSize: 8, color: [60, 60, 60] });

    if (r.metodoLongitudEquivalente === 'accesorios_detallados') {
      const resumenAccesorios =
        r.accesoriosDetalle.length > 0
          ? r.accesoriosDetalle
              .map(acc => `${acc.nombre} x${acc.cantidad} (= ${acc.longitudEquivalente.toFixed(2)} m)`) 
              .join(' | ')
          : 'Sin accesorios cargados para este tramo.';
      y = drawWrappedLine(`Accesorios: ${resumenAccesorios}`, y, {
        fontSize: 8,
        color: [60, 60, 60],
      });
    }

    y = drawWrappedLine(
      `Diámetro: ${r.diametroComercial}  |  Caída real: ${r.caida_presion.toFixed(3)} mbar  |  Velocidad: ${r.velocidad.toFixed(1)} m/s  |  ${r.ok ? 'DENTRO DE REFERENCIA' : 'REQUIERE AJUSTE'}`,
      y,
      { fontSize: 8, color: r.ok ? [0, 120, 0] : [200, 0, 0] }
    );

    if (r.advertencias.length > 0) {
      y = drawWrappedLine(`Advertencias técnicas: ${r.advertencias.join(' | ')}`, y, {
        fontSize: 8,
        color: [180, 80, 0],
      });
    }

    y += 3;
  }

  // Resultado global
  if (y > breakThreshold()) { doc.addPage(); currentPage++; y = 15; }
  const allOk = resultados.tramos.every(t => t.ok);
  const caidaTotal = resultados.tramos.reduce((s, t) => s + t.caida_presion, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Resultado global', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  if (allOk) doc.setTextColor(0, 120, 0); else doc.setTextColor(200, 0, 0);
  doc.text(`Caída de presión total (suma de tramos): ${caidaTotal.toFixed(3)} mbar`, margin + 2, y);
  y += 4.5;
  doc.text(
    allOk ? 'Dentro de referencia tecnica de 1 mbar (10 mmcda). Verificar con criterio profesional.' : 'Fuera de referencia tecnica. Revisar tramos marcados.',
    margin + 2, y
  );
  doc.setTextColor(0, 0, 0);
  y += 9;

  // ── Ventilación ───────────────────────────────────────────────────────
  sectionHeader('Ventilación (NAG-200 Cap. 6 / práctica habitual)');

  const vent = resultados.ventilacion;
  if (formData.artefactosInstalados.length === 0) {
    doc.setFontSize(8);
    doc.text('Sin ambientes cargados. Verificar ventilación según NAG-200 Cap. 6 y especificaciones del artefacto.', margin + 2, y);
    y += 8;
  } else {
    autoTable(doc, {
      startY: y,
      body: [
        ['Potencia total (con simultaneidad):', `${vent.consumoTotalKW.toFixed(2)} kW`],
        [`Ratio (${formData.ratioVentilacion} cm²/kW):`, `Área total: ${vent.areaRequerida.toFixed(1)} cm²`],
        ['Rejilla inferior (< 30 cm del piso):', `${vent.areaRejillaInferior.toFixed(0)} cm² (mín. 100 cm²)`],
        ['Rejilla superior (> 1,80 m del piso):', `${vent.areaRejillaSuperior.toFixed(0)} cm² (mín. 100 cm²)`],
      ],
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 1.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80 } },
      margin: { left: margin, right: margin },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
    if ((doc as any).lastAutoTable.finalPage > currentPage) currentPage = (doc as any).lastAutoTable.finalPage;
  }

  // ── Checklist ─────────────────────────────────────────────────────────
  if (y > breakThreshold()) { doc.addPage(); currentPage++; y = 15; }
  sectionHeader('Checklist técnico de verificación previa a habilitación (NAG-200 / Ley 24.076)');

  const checklist = [
    'Válvula de corte general ubicada y accesible.',
    'Válvula de corte individual por cada artefacto.',
    'Prueba de hermeticidad: 150 mbar / 15 min con aire (NAG-200) · alt. 200 mmH2O / 15 min (manómetro en U).',
    'Distancias mínimas a fuentes de ignición verificadas (mín. 1,5 m).',
    'Distancia mínima 3 cm de cañerías eléctricas.',
    'Rejilla inferior ubicada a menos de 30 cm del piso.',
    'Rejilla superior ubicada a más de 1,80 m del piso.',
    'Ventilación permanente de combustión garantizada (NAG-200 Cap. 6).',
    'Artefactos de tiro balanceado en baños y dormitorios.',
    'Cañería identificada (pintura amarilla en tramos visibles).',
    'Plano de instalación confeccionado y firmado (Ley 24.076).',
    'Formulario F 3.5 / F 3.4 A completado con número de matrícula.',
  ];

  for (const item of checklist) {
    if (y > breakThreshold()) { doc.addPage(); currentPage++; y = 15; }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(29, 78, 216);
    doc.text('[ ]', margin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.text(item, margin + 10, y);
    y += 5;
  }

  y += 4;

  // ── Aviso legal debajo del checklist; sólo salta si no entra ──────────
  if (y + avisoH > AVISO_BOTTOM) {
    doc.addPage();
    currentPage++;
    y = 15;
  }
  drawAviso(y);

  // ── Pie de página ─────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Calculadora Gas NAG-200 | Pág. ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 3,
      { align: 'center' }
    );
  }

  const nombreArchivo = `informe-gas-${datosGenerales.direccion.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
  doc.save(nombreArchivo);
}
