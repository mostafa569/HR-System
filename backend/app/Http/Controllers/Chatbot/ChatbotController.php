<?php

namespace App\Http\Controllers\Chatbot;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Department;
use App\Models\Holiday;
use App\Models\Attendance;
use App\Models\SalarySummary;
use App\Models\Adjustment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Smalot\PdfParser\Parser;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $message = $request->input('message');
            
            if (empty($message)) {
                return response()->json([
                    'success' => false,
                    'response' => 'Please provide a message.',
                    'timestamp' => now()
                ], 400);
            }
            
            $response = $this->processMessage($message);
            
            return response()->json([
                'success' => true,
                'response' => $response,
                'timestamp' => now()
            ]);
        } catch (\Exception $e) {
            \Log::error('Chatbot error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'response' => 'Sorry, I encountered an error. Please try again.',
                'timestamp' => now()
            ], 500);
        }
    }

    public function uploadPdf(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        
        try {
             
            $parser = new Parser();
            $pdf = $parser->parseFile($file->getRealPath());
            $text = $pdf->getText();
            
             
            $wordCount = str_word_count($text);
            $charCount = strlen($text);
            $lineCount = substr_count($text, "\n") + 1;
            $paragraphCount = substr_count(trim($text), "\n\n") + 1;
            
             
            $preview = substr($text, 0, 800);
            if (strlen($text) > 800) {
                $preview .= "...";
            }
            
             
            $preview = str_replace(["\n", "\r"], " ", $preview);
            $preview = preg_replace('/\s+/', ' ', $preview);
            $preview = trim($preview);
            
             
            $readingTime = ceil($wordCount / 200);
            
            $summary = "📄  PDF Document Analysis: {$fileName} \n\n" .
                       "📊  Document Statistics: \n" .
                       "•  File Size:  " . number_format($fileSize / 1024, 2) . " KB\n" .
                       "•  Total Words:  " . number_format($wordCount) . "\n" .
                       "•  Total Characters:  " . number_format($charCount) . "\n" .
                       "•  Total Lines:  " . number_format($lineCount) . "\n" .
                       "•  Paragraphs:  " . number_format($paragraphCount) . "\n" .
                       "•  Estimated Reading Time:  {$readingTime} minutes\n\n" .
                       "📖  Content Preview: \n" .
                       "```\n" .
                       $preview .
                       "\n```\n\n" ;
                       
            return response()->json([
                'success' => true,
                'response' => $summary
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'response' => "❌  Error processing PDF:  " . $e->getMessage() . "\n\nPlease ensure the PDF file is not corrupted or password-protected."
            ]);
        }
    }

  
    private function processMessage($message)
    {
        $message = strtolower(trim($message));
        
         
        if (str_contains($message, 'statistics') || str_contains($message, 'stats') || str_contains($message, 'overview')) {
            return $this->getGeneralStats();
        }
        
       
        if (str_contains($message, 'employee') || str_contains($message, 'employer') || str_contains($message, 'staff')) {
            return $this->getEmployerInfo($message);
        }
        
         
        if (str_contains($message, 'department') || str_contains($message, 'dept')) {
            return $this->getDepartmentInfo($message);
        }
        
         
        if (str_contains($message, 'holiday') || str_contains($message, 'vacation') || str_contains($message, 'leave')) {
            return $this->getHolidayInfo($message);
        }
        
         
        if (str_contains($message, 'attendance') || str_contains($message, 'present') || str_contains($message, 'absent')) {
            return $this->getAttendanceInfo($message);
        }
        
         
        if (str_contains($message, 'salary') || str_contains($message, 'payroll') || str_contains($message, 'payment')) {
            return $this->getSalaryInfo($message);
        }
        
        
        if (str_contains($message, 'help') || str_contains($message, 'assist') || str_contains($message, 'guide')) {
            return $this->getHelp();
        }
        
         
        return "Hello! I'm the HR System AI Assistant. I can help you with:\n" .
               "• System statistics\n" .
               "• Employee information\n" .
               "• Department information\n" .
               "• Holiday information\n" .
               "• Attendance information\n" .
               "• Salary information\n" .
               "Type 'help' to see all available commands.";
    }

    private function getGeneralStats()
    {
        $totalEmployers = Employer::count();
        $totalDepartments = Department::count();
        $totalHolidays = Holiday::count();
        $todayAttendance = Attendance::whereDate('created_at', today())->count();
        
        return "📊 System Statistics:\n" .
               "• Total Employees: {$totalEmployers}\n" .
               "• Total Departments: {$totalDepartments}\n" .
               "• Total Holidays: {$totalHolidays}\n" .
               "• Today's Attendance: {$todayAttendance}";
    }

    private function getEmployerInfo($message)
    {
         
        if (str_contains($message, 'count') || str_contains($message, 'total') || str_contains($message, 'how many')) {
            $count = Employer::count();
            $activeCount = Employer::whereNotNull('contract_date')->count();
            return "📊 Employee Statistics:\n" .
                   "• Total Employees: {$count}\n" .
                   "• Active Employees: {$activeCount}";
        }
        
         
        if (str_contains($message, 'recent') || str_contains($message, 'new') || str_contains($message, 'latest')) {
            $recent = Employer::with('department')->latest()->take(5)->get();
            $response = "📅 Latest 5 employees added:\n";
            foreach ($recent as $employer) {
                $departmentName = $employer->department ? $employer->department->name : 'No Department';
                $response .= "• {$employer->full_name} - {$departmentName} (Phone: {$employer->phone})\n";
            }
            return $response;
        }
        
      
        if (str_contains($message, 'list') || str_contains($message, 'all employees') || str_contains($message, 'show all')) {
            $employers = Employer::with('department')->take(10)->get();
            $response = "👥 First 10 employees:\n";
            foreach ($employers as $employer) {
                $departmentName = $employer->department ? $employer->department->name : 'No Department';
                $response .= "• {$employer->full_name} - {$departmentName}\n";
            }
            return $response;
        }
        
         
        if (preg_match('/(?:employee|employer|staff|details for|info for|show me|find|search for)\s+([a-zA-Z0-9\s]+)/i', $message, $matches)) {
            $name = trim($matches[1]);
            
            
            $commandWords = ['count', 'total', 'recent', 'new', 'latest', 'list', 'all', 'show'];
            if (in_array(strtolower($name), $commandWords)) {
                return "I can help you with employee information. Try:\n" .
                       "• 'employee count' to see total count\n" .
                       "• 'recent employees' to see latest additions\n" .
                       "• 'employee [name]' to see details for a specific employee\n" .
                       "• 'list employees' to see all employees\n" .
                       "• You can search by name or phone number";
            }
            
             
            $employer = Employer::where('full_name', $name)->with('department')->first();
            
            
            if (!$employer) {
                $employer = Employer::where('full_name', 'LIKE', "%{$name}%")->with('department')->first();
            }
            
             
            if (!$employer && is_numeric($name)) {
                $employer = Employer::where('phone', 'LIKE', "%{$name}%")->with('department')->first();
            }

            if ($employer) {
                $departmentName = $employer->department ? $employer->department->name : 'N/A';
                $salary = $employer->salary ? number_format($employer->salary, 2) . ' SAR' : 'N/A';
                
                return "👤 Employee Details for {$employer->full_name}:\n" .
                       "• Phone: {$employer->phone}\n" .
                       "• Department: {$departmentName}\n" .
                       "• Nationality: {$employer->nationality}\n" .
                       "• Contract Date: {$employer->contract_date}\n" .
                       "• Salary: {$salary}\n" .
                       "• Gender: {$employer->gender}\n" .
                       "• Address: {$employer->address}";
            } else {
               
                $similarEmployers = Employer::where('full_name', 'LIKE', "%{$name}%")
                    ->orWhere('phone', 'LIKE', "%{$name}%")
                    ->take(3)
                    ->get(['full_name', 'phone']);
                
                if ($similarEmployers->count() > 0) {
                    $response = "Sorry, I couldn't find an employee named '{$name}'.\n\nDid you mean one of these?\n";
                    foreach ($similarEmployers as $emp) {
                        $response .= "• {$emp->full_name} (Phone: {$emp->phone})\n";
                    }
                    return $response;
                } else {
                    return "Sorry, I couldn't find any employee matching '{$name}'.\n\nTry:\n" .
                           "• 'employee count' to see total employees\n" .
                           "• 'recent employees' to see latest additions\n" .
                           "• Make sure you're using the correct name or phone number";
                }
            }
        }
        
        
        return "I can help you with employee information. Try:\n" .
               "• 'employee count' to see total count\n" .
               "• 'recent employees' to see latest additions\n" .
               "• 'employee [name]' to see details for a specific employee\n" .
               "• 'list employees' to see all employees\n" .
               "• You can search by name or phone number";
    }

    private function getDepartmentInfo($message)
    {
        
        if (preg_match('/(?:in|employees in|staff in|who is in|in the)\s+([a-zA-Z\s]+)\s*(?:department)?/i', $message, $matches)) {
            $deptName = trim($matches[1]);
            $department = Department::where('name', 'LIKE', "%{$deptName}%")->with('employers')->first();

            if ($department) {
                $response = "👥 Employees in {$department->name}:\n";
                if ($department->employers->count() > 0) {
                    foreach ($department->employers as $employer) {
                        $response .= "• {$employer->full_name}\n";
                    }
                } else {
                    $response .= "No employees found in this department.";
                }
                return $response;
            } else {
                return "Sorry, I couldn't find a department named '{$deptName}'.";
            }
        }

        if (str_contains($message, 'count') || str_contains($message, 'total')) {
            $count = Department::count();
            return "Total number of departments: {$count}";
        }
        
        $departments = Department::withCount('employers')->get();
        $response = "Departments and employee count:\n";
        foreach ($departments as $dept) {
            $response .= "• {$dept->name}: {$dept->employers_count} employees\n";
        }
        return $response;
    }

    private function getHolidayInfo($message)
    {
        if (str_contains($message, 'upcoming') || str_contains($message, 'next') || str_contains($message, 'future')) {
            $upcoming = Holiday::where('date', '>=', now())->orderBy('date')->take(5)->get();
            $response = "Upcoming holidays:\n";
            foreach ($upcoming as $holiday) {
                $response .= "• {$holiday->name} - {$holiday->date}\n";
            }
            return $response;
        }
        
        $count = Holiday::count();
        return "Total number of holidays: {$count}\n" .
               "Type 'upcoming holidays' to see future holidays";
    }

    private function getAttendanceInfo($message)
    {
         
        if (preg_match('/(?:attendance for|presence of|did)\s+(.+?)\s+(?:attend|come in|work)/i', $message, $matches)) {
            $name = trim($matches[1]);
            $employer = Employer::where('full_name', 'LIKE', "%{$name}%")->first();

            if ($employer) {
                $todayAttendance = Attendance::where('employer_id', $employer->id)
                    ->whereDate('created_at', today())
                    ->first();
                
                if ($todayAttendance) {
                    return "✅ Yes, {$employer->full_name} was present today. Attended at: " . $todayAttendance->created_at->format('H:i:s');
                } else {
                    return "❌ No, {$employer->full_name} has not been marked as present today.";
                }
            } else {
                return "Sorry, I couldn't find an employee named '{$name}'.";
            }
        }
        
        if (str_contains($message, 'today') || str_contains($message, 'current')) {
            $today = Attendance::whereDate('created_at', today())->count();
            return "Today's attendance count: {$today}";
        }
        
        if (str_contains($message, 'this month') || str_contains($message, 'monthly')) {
            $thisMonth = Attendance::whereMonth('created_at', now()->month)->count();
            return "This month's attendance count: {$thisMonth}";
        }
        
        return "I can help you with attendance information. Try:\n" .
               "• 'today attendance' to see today's count\n" .
               "• 'this month attendance' to see monthly count\n" .
               "• 'attendance for [employee name] today' to check a specific employee";
    }

    private function getSalaryInfo($message)
    {
        if (str_contains($message, 'total') || str_contains($message, 'sum')) {
            $totalSalaries = SalarySummary::sum('total_salary');
            return "Total salaries: " . number_format($totalSalaries, 2) . " SAR";
        }
        
        return "I can help you with salary information. Try:\n" .
               "• 'total salaries' to see total salary amount";
    }

    private function getHelp()
    {
        return "🤖 AI Assistant Commands:\n\n" .
               "📊  Statistics \n" .
               "   - 'statistics': Show general system stats.\n\n" .
               "👥  Employees \n" .
               "   - 'employee count': Get the total number of employees.\n" .
               "   - 'recent employees': List the newest employees.\n" .
               "   - 'list employees': Show first 10 employees.\n" .
               "   - 'employee [name]': Show details for a specific employee.\n" .
               "   - 'find [name]': Search for employee by name.\n" .
               "   - 'search for [phone]': Search for employee by phone number.\n\n" .
               "🏢  Departments \n" .
               "   - 'department info': List all departments and their employee counts.\n" .
               "   - 'employees in [department name]': List all employees in a specific department.\n\n" .
               "🏖️  Holidays \n" .
               "   - 'upcoming holidays': See the next upcoming holidays.\n\n" .
               "⏰  Attendance \n" .
               "   - 'today attendance': See how many employees attended today.\n" .
               "   - 'did [employee name] attend today': Check if a specific employee was present.\n\n" .
               "💰  Salaries \n" .
               "   - 'total salaries': Show the total salary amount for all employees.";
    }
} 