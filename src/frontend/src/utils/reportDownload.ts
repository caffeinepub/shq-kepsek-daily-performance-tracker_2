import type { DailyMonitoringRow } from '../backend';

/**
 * Utility to download admin monitoring data as CSV
 */

export function downloadReportsAsCSV(rows: DailyMonitoringRow[], selectedDate: Date) {
  // Prepare CSV headers
  const headers = [
    'Nama Sekolah',
    'Wilayah',
    'Nama Kepala Sekolah',
    'Principal ID',
    'Status Laporan',
    'Skor Total',
    'Skor Kehadiran',
    'Skor Kontrol Kelas',
    'Skor Kontrol Guru',
    'Skor Respon Wali Santri',
    'Skor Program & Problem Solving',
    'Jam Datang',
    'Jam Pulang',
    'Foto Kehadiran',
    'Catatan Presensi',
    'Catatan Kontrol Kelas',
    'Catatan Kontrol Guru',
    'Catatan Wali Santri',
    'Catatan Program',
  ];

  // Helper to format time from nanoseconds
  const formatTime = (nanos: bigint): string => {
    if (nanos === BigInt(0)) return '-';
    const milliseconds = Number(nanos / BigInt(1_000_000));
    const date = new Date(milliseconds);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Helper to escape CSV values
  const escapeCSV = (value: string): string => {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  // Build CSV rows
  const csvRows = rows.map((row) => {
    const report = row.report;
    const hasReport = !!report;

    return [
      escapeCSV(row.school.name),
      escapeCSV(row.school.region),
      escapeCSV(row.school.principalName),
      row.principal.toString(),
      hasReport ? 'Sudah Lapor' : 'Belum Lapor',
      hasReport ? Number(report.totalScore).toString() : '0',
      hasReport ? Number(report.attendanceScore).toString() : '0',
      hasReport ? Number(report.classControlScore).toString() : '0',
      hasReport ? Number(report.teacherControlScore).toString() : '0',
      hasReport ? Number(report.waliSantriResponseScore).toString() : '0',
      hasReport ? Number(report.programProblemSolvingScore).toString() : '0',
      hasReport ? formatTime(report.date) : '-',
      hasReport ? formatTime(report.departureTime) : '-',
      hasReport && report.attendancePhoto ? report.attendancePhoto.getDirectURL() : '-',
      hasReport ? escapeCSV(report.catatanPresensi || '-') : '-',
      hasReport ? escapeCSV(report.catatanAmatanKelas || '-') : '-',
      hasReport ? escapeCSV(report.catatanMonitoringGuru || '-') : '-',
      hasReport ? escapeCSV(report.catatanWaliSantri || '-') : '-',
      hasReport ? escapeCSV(report.catatanPermasalahanProgram || '-') : '-',
    ].join(',');
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Format filename with date
  const dateStr = selectedDate.toISOString().split('T')[0];
  link.download = `laporan-harian-${dateStr}.csv`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
