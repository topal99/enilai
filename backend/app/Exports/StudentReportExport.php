<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class StudentReportExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $student;
    protected $reportData;
    protected $attendanceSummary;

    public function __construct($student, $reportData, $attendanceSummary)
    {
        $this->student = $student;
        $this->reportData = $reportData;
        $this->attendanceSummary = $attendanceSummary;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Ubah data laporan menjadi koleksi yang bisa di-map
        return collect($this->reportData);
    }

    /**
     * Menambahkan baris judul di atas header utama.
     */
    public function headings(): array
    {
        return [
            // Baris 1: Informasi Siswa
            ['Rapor Akademik Siswa'],
            ['Nama Siswa', $this->student['name']],
            ['Kelas', $this->student['class']],
            ['Semester', $this->student['semester']],
            [' '], // Baris kosong sebagai pemisah

            // Baris 2: Header Tabel Nilai
            [
                'Mata Pelajaran',
                'Rata-rata Nilai',
            ],
        ];
    }

    /**
     * Memetakan data dari setiap mata pelajaran.
     */
    public function map($row): array
    {
        // $row di sini adalah data untuk satu mata pelajaran
        // Kita ambil key (nama mapel) dan value (rata-rata)
        // Ini butuh sedikit penyesuaian karena FromCollection mengharapkan array of arrays
        // Kita akan lakukan ini di controller saja agar lebih mudah.
        
        // Untuk sekarang, kita kembalikan array kosong karena logika akan ditangani di controller
        // dengan pendekatan yang berbeda (FromView).
        return []; 
    }
    
    /**
     * Mengatur style untuk worksheet.
     */
    public function styles(Worksheet $sheet)
    {
        // Membuat judul utama tebal dan besar
        $sheet->mergeCells('A1:B1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

        // Membuat sub-judul tebal
        $sheet->getStyle('A2:A4')->getFont()->setBold(true);
        $sheet->getStyle('A6:B6')->getFont()->setBold(true);
        
        // Menambahkan border pada tabel nilai
        $lastRow = count($this->reportData) + 6;
        $sheet->getStyle('A6:B' . $lastRow)->getBorders()->getAllBorders()->setBorderStyle(\PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN);

        // Menambahkan rekap absensi di bawah tabel nilai
        $attendanceStartRow = $lastRow + 2;
        $sheet->setCellValue('A' . $attendanceStartRow, 'Rekap Absensi');
        $sheet->getStyle('A' . $attendanceStartRow)->getFont()->setBold(true);
        $sheet->setCellValue('A' . ($attendanceStartRow + 1), 'Hadir');
        $sheet->setCellValue('B' . ($attendanceStartRow + 1), $this->attendanceSummary['hadir']);
        $sheet->setCellValue('A' . ($attendanceStartRow + 2), 'Sakit');
        $sheet->setCellValue('B' . ($attendanceStartRow + 2), $this->attendanceSummary['sakit']);
        $sheet->setCellValue('A' . ($attendanceStartRow + 3), 'Izin');
        $sheet->setCellValue('B' . ($attendanceStartRow + 3), $this->attendanceSummary['izin']);
        $sheet->setCellValue('A' . ($attendanceStartRow + 4), 'Alpa');
        $sheet->setCellValue('B' . ($attendanceStartRow + 4), $this->attendanceSummary['alpa']);

        return [];
    }
}