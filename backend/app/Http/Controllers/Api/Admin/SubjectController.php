<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index() { return Subject::latest()->paginate(10); }

    public function store(Request $request) {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:subjects']);
        $subject = Subject::create($validated);
        return response()->json($subject, 201);
    }

    public function update(Request $request, Subject $subject) {
        $validated = $request->validate(['name' => 'required|string|max:255|unique:subjects,name,' . $subject->id]);
        $subject->update($validated);
        return response()->json($subject);
    }

    public function destroy(Subject $subject) {
        $subject->delete();
        return response()->json(['message' => 'Mata pelajaran berhasil dihapus.']);
    }

    public function getAllSubjects()
    {
        return Subject::latest()->get();
    }

}