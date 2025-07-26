<?php

namespace App\Exports;

use App\Models\Grade;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class GradesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $grades;

    public function __construct($grades)
    {
        $this->grades = $grades;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        // Data yang akan diekspor adalah data yang kita kirim dari controller
        return $this->grades;
    }

    /**
     * Mendefinisikan header untuk setiap kolom di file Excel.
     */
    public function headings(): array
    {
        return [
            'Tanggal Ujian',
            'Nama Murid',
            'Kelas',
            'Mata Pelajaran',
            'Jenis Ujian',
            'Nilai',
        ];
    }

    /**
     * Memetakan data dari setiap objek Grade ke dalam baris Excel.
     * @var Grade $grade
     */
    public function map($grade): array
    {
        return [
            $grade->exam_date,
            $grade->studentProfile->user->name,
            $grade->studentProfile->classModel->level . '-' . $grade->studentProfile->classModel->name,
            $grade->subject->name,
            $grade->gradeType->name,
            $grade->score,
        ];
    }
}