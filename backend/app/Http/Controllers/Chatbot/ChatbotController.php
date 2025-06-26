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
            
            // CV Rating Analysis
            $cvRating = $this->analyzeCvContent($text, $fileName, $wordCount, $paragraphCount);
            
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
                       "\n```\n\n" .
                       $cvRating;
                       
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

    private function analyzeCvContent($text, $fileName, $wordCount, $paragraphCount)
    {
        $text = strtolower($text);
        $score = 0;
        $maxScore = 100;
        $feedback = [];
        
        // Check if it's likely a CV/Resume
        $cvKeywords = ['resume', 'cv', 'curriculum vitae', 'experience', 'education', 'skills', 'work history', 'employment'];
        $isCv = false;
        foreach ($cvKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $isCv = true;
                break;
            }
        }
        
        if (!$isCv) {
            return "📋  Document Type: General PDF Document\n" .
                   "This appears to be a general document, not specifically a CV/Resume.\n\n";
        }
        
        // 1. Contact Information (15 points)
        $contactScore = 0;
        $contactInfo = [];
        
        // Email check
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Email address found";
        } else {
            $contactInfo[] = "❌ No email address found";
        }
        
        // Phone check
        if (preg_match('/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Phone number found";
        } else {
            $contactInfo[] = "❌ No phone number found";
        }
        
        // Address check
        if (preg_match('/(street|avenue|road|drive|lane|boulevard|city|state|zip|postal)/', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Address information found";
        } else {
            $contactInfo[] = "❌ No address information found";
        }
        
        $score += $contactScore;
        $feedback[] = "📞 Contact Information: {$contactScore}/15 points\n" . implode("\n", $contactInfo);
        
        // 2. Education Section (20 points)
        $educationScore = 0;
        $educationInfo = [];
        
        $educationKeywords = ['education', 'degree', 'bachelor', 'master', 'phd', 'university', 'college', 'school', 'graduation'];
        $educationFound = false;
        foreach ($educationKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $educationFound = true;
                break;
            }
        }
        
        if ($educationFound) {
            $educationScore += 15;
            $educationInfo[] = "✅ Education section found";
        } else {
            $educationInfo[] = "❌ No education section found";
        }
        
        // Check for degree types
        $degreeTypes = ['bachelor', 'master', 'phd', 'associate', 'diploma'];
        $degreeCount = 0;
        foreach ($degreeTypes as $degree) {
            if (str_contains($text, $degree)) {
                $degreeCount++;
            }
        }
        
        if ($degreeCount > 0) {
            $educationScore += min(5, $degreeCount);
            $educationInfo[] = "✅ Found {$degreeCount} degree(s) mentioned";
        }
        
        $score += $educationScore;
        $feedback[] = "🎓 Education: {$educationScore}/20 points\n" . implode("\n", $educationInfo);
        
        // 3. Work Experience (25 points)
        $experienceScore = 0;
        $experienceInfo = [];
        
        $experienceKeywords = ['experience', 'work history', 'employment', 'job', 'position', 'role', 'responsibilities'];
        $experienceFound = false;
        foreach ($experienceKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $experienceFound = true;
                break;
            }
        }
        
        if ($experienceFound) {
            $experienceScore += 15;
            $experienceInfo[] = "✅ Work experience section found";
        } else {
            $experienceInfo[] = "❌ No work experience section found";
        }
        
        // Check for job titles
        $jobTitles = ['manager', 'director', 'supervisor', 'coordinator', 'specialist', 'analyst', 'developer', 'engineer'];
        $jobTitleCount = 0;
        foreach ($jobTitles as $title) {
            if (str_contains($text, $title)) {
                $jobTitleCount++;
            }
        }
        
        if ($jobTitleCount > 0) {
            $experienceScore += min(10, $jobTitleCount * 2);
            $experienceInfo[] = "✅ Found {$jobTitleCount} job title(s)";
        }
        
        $score += $experienceScore;
        $feedback[] = "💼 Work Experience: {$experienceScore}/25 points\n" . implode("\n", $experienceInfo);
        
        // 4. Skills Section (20 points)
        $skillsScore = 0;
        $skillsInfo = [];
        
        if (str_contains($text, 'skills') || str_contains($text, 'competencies') || str_contains($text, 'abilities')) {
            $skillsScore += 10;
            $skillsInfo[] = "✅ Skills section found";
        } else {
            $skillsInfo[] = "❌ No skills section found";
        }
        
        // Count technical skills
        $technicalSkills = ['programming', 'software', 'technology', 'computer', 'database', 'web', 'mobile', 'cloud', 'ai', 'machine learning'];
        $techSkillCount = 0;
        foreach ($technicalSkills as $skill) {
            if (str_contains($text, $skill)) {
                $techSkillCount++;
            }
        }
        
        if ($techSkillCount > 0) {
            $skillsScore += min(10, $techSkillCount * 2);
            $skillsInfo[] = "✅ Found {$techSkillCount} technical skill(s)";
        }
        
        $score += $skillsScore;
        $feedback[] = "🔧 Skills: {$skillsScore}/20 points\n" . implode("\n", $skillsInfo);
        
        // 5. Professional Summary/Objective (10 points)
        $summaryScore = 0;
        $summaryInfo = [];
        
        $summaryKeywords = ['summary', 'objective', 'profile', 'overview', 'introduction'];
        $summaryFound = false;
        foreach ($summaryKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $summaryFound = true;
                break;
            }
        }
        
        if ($summaryFound) {
            $summaryScore += 10;
            $summaryInfo[] = "✅ Professional summary/objective found";
        } else {
            $summaryInfo[] = "❌ No professional summary/objective found";
        }
        
        $score += $summaryScore;
        $feedback[] = "📝 Professional Summary: {$summaryScore}/10 points\n" . implode("\n", $summaryInfo);
        
        // 6. Document Length and Structure (10 points)
        $structureScore = 0;
        $structureInfo = [];
        
        // Check document length
        if ($wordCount >= 200 && $wordCount <= 1000) {
            $structureScore += 5;
            $structureInfo[] = "✅ Appropriate document length ({$wordCount} words)";
        } else {
            $structureInfo[] = "⚠️ Document length may need adjustment ({$wordCount} words)";
        }
        
        // Check for proper structure
        if ($paragraphCount >= 5) {
            $structureScore += 5;
            $structureInfo[] = "✅ Good document structure ({$paragraphCount} paragraphs)";
        } else {
            $structureInfo[] = "⚠️ Document structure could be improved";
        }
        
        $score += $structureScore;
        $feedback[] = "📋 Document Structure: {$structureScore}/10 points\n" . implode("\n", $structureInfo);
        
        // Calculate overall rating
        $percentage = round(($score / $maxScore) * 100);
        $rating = $this->getRatingLevel($percentage);
        
        return "📋  CV/Resume Analysis & Rating\n\n" .
               "⭐ Overall Rating: {$rating} ({$percentage}%)\n" .
               "📊 Total Score: {$score}/{$maxScore} points\n\n" .
               "📋 Detailed Feedback:\n" .
               implode("\n\n", $feedback) . "\n\n" .
               "💡 Recommendations:\n" .
               $this->getRecommendations($score, $maxScore);
    }
    
    private function getRatingLevel($percentage)
    {
        if ($percentage >= 90) return "🌟 Excellent";
        if ($percentage >= 80) return "⭐ Very Good";
        if ($percentage >= 70) return "👍 Good";
        if ($percentage >= 60) return "✅ Fair";
        if ($percentage >= 50) return "⚠️ Needs Improvement";
        return "❌ Poor";
    }
    
    private function getRecommendations($score, $maxScore)
    {
        $percentage = round(($score / $maxScore) * 100);
        $recommendations = [];
        
        if ($percentage < 80) {
            $recommendations[] = "• Add missing contact information (email, phone, address)";
        }
        
        if ($percentage < 70) {
            $recommendations[] = "• Include a clear education section with degree details";
        }
        
        if ($percentage < 75) {
            $recommendations[] = "• Expand work experience section with specific job titles and responsibilities";
        }
        
        if ($percentage < 70) {
            $recommendations[] = "• Add a comprehensive skills section";
        }
        
        if ($percentage < 60) {
            $recommendations[] = "• Include a professional summary or objective statement";
        }
        
        if (empty($recommendations)) {
            $recommendations[] = "• Great job! Your CV is well-structured and comprehensive";
        }
        
        return implode("\n", $recommendations);
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