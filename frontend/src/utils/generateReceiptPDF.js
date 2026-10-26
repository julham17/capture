import { jsPDF } from 'jspdf';

/**
 * Generate dan unduh dokumen PDF Resi Pemesanan resmi untuk Capture Atelier.
 * @param {Object} data - Objek data booking
 */
export const generateReceiptPDF = (data) => {
    if (!data) return;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const gold = [212, 175, 55];
    const darkBg = [14, 14, 18];
    const darkText = [30, 30, 35];
    const mutedText = [110, 110, 120];
    const borderGray = [225, 225, 230];

    // ── 1. TOP HEADER BANNER (Luxury Dark Slate) ──
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(0, 0, 210, 42, 'F');

    // Hairline Gold Accent Strip
    doc.setFillColor(gold[0], gold[1], gold[2]);
    doc.rect(0, 42, 210, 2, 'F');

    // Brand Logo & Monogram
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('iDzoel', 16, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('PHOTO STUDIO', 16, 26);

    doc.setFontSize(7);
    doc.setTextColor(180, 180, 190);
    doc.text('Jl. Gatot Subroto No.170, Gumuruh, Kec. Batununggal, Kota Bandung, Jawa Barat 40275 · Whatsapp: +62 896-7330-9449', 16, 32);

    // Header Right: Title of Document
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('BUKTI RESERVASI RESMI', 194, 20, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(230, 230, 230);
    doc.text('OFFICIAL BOOKING VOUCHER', 194, 26, { align: 'right' });

    // ── 2. RESI META CARD ──
    const metaY = 52;
    doc.setFillColor(250, 250, 252);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.4);
    doc.roundedRect(15, metaY, 180, 24, 2.5, 2.5, 'FD');

    // Column 1: Kode Resi
    doc.setFontSize(7.5);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('KODE RESI / BOOKING CODE', 22, metaY + 8);

    doc.setFontSize(13);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(String(data.booking_code || 'STO-000000'), 22, metaY + 17);

    // Column 2: Tanggal Terbit
    const today = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    doc.setFontSize(7.5);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('TANGGAL CETAK RESI', 92, metaY + 8);

    doc.setFontSize(10);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(today, 92, metaY + 16);

    // Column 3: Status Pembayaran
    const status = (data.payment_status || 'pending').toLowerCase();
    let statusLabel = 'MENUNGGU VERIFIKASI';
    let statusColor = [180, 110, 10]; // Amber
    if (status === 'confirmed') {
        statusLabel = 'TERKONFIRMASI (CONFIRMED)';
        statusColor = [16, 140, 80]; // Green
    } else if (status === 'completed') {
        statusLabel = 'SELESAI (COMPLETED)';
        statusColor = [15, 100, 180]; // Blue
    } else if (status === 'canceled') {
        statusLabel = 'DIBATALKAN (CANCELED)';
        statusColor = [180, 30, 30]; // Red
    }

    doc.setFontSize(7.5);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text('STATUS RESERVASI', 145, metaY + 8);

    doc.setFontSize(9);
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(statusLabel, 145, metaY + 16);

    // ── 3. DATA PELANGGAN & DETAIL JADWAL ──
    const section1Y = 86;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('INFORMASI PELANGGAN & RUANGAN STUDIO', 15, section1Y);

    // Line under title
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.6);
    doc.line(15, section1Y + 2, 45, section1Y + 2);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(45, section1Y + 2, 195, section1Y + 2);

    const bookingDateStr = data.booking_date ? data.booking_date.split('T')[0] : '-';
    const scheduleTimeStr = `${data.start_time || '-'} – ${data.end_time || '-'} WIB`;

    const infoRows = [
        ['Nama Lengkap Tamu', data.customer_name || '-'],
        ['Email Pelanggan', data.customer_email || '-'],
        ['Nomor WhatsApp / Telp', data.customer_phone || '-'],
        ['Ruangan Studio', data.studio_name || '-'],
        ['Tanggal Pelaksanaan', bookingDateStr],
        ['Waktu & Durasi Sesi', scheduleTimeStr]
    ];

    let rowY = section1Y + 10;
    infoRows.forEach(([label, value], idx) => {
        // Zebra row background
        if (idx % 2 === 0) {
            doc.setFillColor(248, 248, 250);
            doc.rect(15, rowY - 4.5, 180, 8, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
        doc.text(label, 19, rowY);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkText[0], darkText[1], darkText[2]);
        doc.text(String(value), 85, rowY);

        rowY += 8.5;
    });

    // ── 4. RINCIAN BIAYA & PEMBAYARAN ──
    const section2Y = rowY + 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('RINCIAN TARIF & BIAYA SEWA', 15, section2Y);

    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.6);
    doc.line(15, section2Y + 2, 45, section2Y + 2);
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.2);
    doc.line(45, section2Y + 2, 195, section2Y + 2);

    // Table Header
    const tableHeaderY = section2Y + 8;
    doc.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
    doc.rect(15, tableHeaderY, 180, 7.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text('DESKRIPSI ITEM', 20, tableHeaderY + 5);
    doc.text('JADWAL WAKTU', 105, tableHeaderY + 5);
    doc.text('JUMLAH BIAYA', 190, tableHeaderY + 5, { align: 'right' });

    // Table Row 1
    const tableRowY = tableHeaderY + 13;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text(`Sewa Studio: ${data.studio_name || 'Studio Foto'}`, 20, tableRowY);

    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(scheduleTimeStr, 105, tableRowY);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    const formattedPrice = `Rp ${Number(data.total_price || 0).toLocaleString('id-ID')}`;
    doc.text(formattedPrice, 190, tableRowY, { align: 'right' });

    // Table divider
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.line(15, tableRowY + 4, 195, tableRowY + 4);

    // TOTAL AMOUNT BOX
    const totalBoxY = tableRowY + 8;
    doc.setFillColor(252, 249, 238); // Soft Gold Cream
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, totalBoxY, 180, 16, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('TOTAL PEMBAYARAN (NETTO):', 22, totalBoxY + 10);

    doc.setFontSize(13);
    doc.setTextColor(gold[0], gold[1], gold[2]);
    doc.text(formattedPrice, 190, totalBoxY + 10.5, { align: 'right' });

    // ── 5. SYARAT & KETENTUAN KEDATANGAN ──
    const termsY = totalBoxY + 25;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(darkText[0], darkText[1], darkText[2]);
    doc.text('PANDUAN & KETENTUAN ATELIER STUDIO:', 15, termsY);

    const terms = [
        '1. Harap hadir 15 menit sebelum waktu reservasi untuk persiapan alat & koordinasi teknis.',
        '2. Tunjukkan lembar resi digital (PDF) ini kepada staf concierge saat tiba di lokasi studio.',
        '3. Biaya sewa sudah termasuk fasilitas lighting kit standar, ruang ganti privat, dan AC sentral.',
        '4. Konfirmasi pembayaran dan pertanyaan layanan pelanggan via WhatsApp: +62 896-7330-9449.'
    ];

    let termRowY = termsY + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    terms.forEach((t) => {
        doc.text(t, 15, termRowY);
        termRowY += 5;
    });

    // ── 6. FOOTER ──
    doc.setDrawColor(gold[0], gold[1], gold[2]);
    doc.setLineWidth(0.4);
    doc.line(15, 276, 195, 276);

    doc.setFontSize(7);
    doc.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    doc.text(
        'Dokumen ini dicetak otomatis dan sah sebagai voucher reservasi resmi iDzoel PHOTO STUDIO.',
        105,
        282,
        { align: 'center' }
    );
    doc.text('© iDZOEL PHOTO STUDIO · www.idzoelstudio.tech · idzoel@idzoelstudio.tech', 105, 286, { align: 'center' });

    // ── 7. DOWNLOAD PDF ──
    const safeCode = (data.booking_code || 'RESI').replace(/[^a-zA-Z0-9_-]/g, '');
    doc.save(`Resi-Capture-${safeCode}.pdf`);
};
