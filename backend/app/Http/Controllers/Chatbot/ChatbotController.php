<?php

namespace App\Http\Controllers\Chatbot;

use App\Http\Controllers\Controller;
use App\Models\Employer;
use App\Models\Department;
use App\Models\Holiday;
use App\Models\Attendance;
use App\Models\SalarySummary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Smalot\PdfParser\Parser;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        try {
            $message = trim($request->input('message', ''));

            if (empty($message)) {
                return response()->json([
                    'success' => false,
                    'response' => 'Please provide a message.',
                    'timestamp' => now()->toDateTimeString(),
                ], 400);
            }

            // Sanitize input to prevent XSS or SQL injection
            $message = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
            $response = $this->processMessage($message);

            return response()->json([
                'success' => true,
                'response' => $response,
                'timestamp' => now()->toDateTimeString(),
            ]);
        } catch (\Exception $e) {
            \Log::error('Chatbot error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'response' => 'Sorry, I encountered an error. Please try again or contact support.',
                'timestamp' => now()->toDateTimeString(),
            ], 500);
        }
    }

    public function uploadPdf(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf|max:10240', // Max 10MB
        ]);

        try {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $fileSize = $file->getSize();

            $parser = new Parser();
            $pdf = $parser->parseFile($file->getRealPath());
            $text = $pdf->getText();

            // Document statistics
            $wordCount = str_word_count($text);
            $charCount = strlen($text);
            $lineCount = substr_count($text, "\n") + 1;
            $paragraphCount = substr_count(trim($text), "\n\n") + 1;

            // Content preview
            $preview = substr($text, 0, 800);
            if (strlen($text) > 800) {
                $preview .= "...";
            }
            $preview = str_replace(["\n", "\r"], " ", $preview);
            $preview = preg_replace('/\s+/', ' ', $preview);
            $preview = trim($preview);

            // Reading time estimation
            $readingTime = ceil($wordCount / 200);

            // CV analysis
            $cvRating = $this->analyzeCvContent($text, $fileName, $wordCount, $paragraphCount);

            $summary = "📄 PDF Document Analysis: {$fileName}\n\n" .
                       "📊 Document Statistics:\n" .
                       "• File Size: " . number_format($fileSize / 1024, 2) . " KB\n" .
                       "• Total Words: " . number_format($wordCount) . "\n" .
                       "• Total Characters: " . number_format($charCount) . "\n" .
                       "• Total Lines: " . number_format($lineCount) . "\n" .
                       "• Paragraphs: " . number_format($paragraphCount) . "\n" .
                       "• Estimated Reading Time: {$readingTime} minute(s)\n\n" .
                       "📖 Content Preview:\n" .
                       "```\n{$preview}\n```\n\n" .
                       $cvRating;

            return response()->json([
                'success' => true,
                'response' => $summary,
            ]);
        } catch (\Exception $e) {
            \Log::error('PDF upload error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'response' => "❌ Error processing PDF: {$e->getMessage()}\n\nPlease ensure the PDF is not corrupted or password-protected.",
            ], 500);
        }
    }

    private function analyzeCvContent($text, $fileName, $wordCount, $paragraphCount)
    {
        $text = strtolower($text);
        $score = 0;
        $maxScore = 100;
        $feedback = [];

        // Check if document is a CV
        $cvKeywords = ['resume', 'cv', 'curriculum vitae', 'experience', 'education', 'skills', 'work history', 'employment'];
        $isCv = false;
        foreach ($cvKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                $isCv = true;
                break;
            }
        }

        if (!$isCv) {
            return "📋 Document Type: General PDF Document\n" .
                   "This appears to be a general document, not specifically a CV/Resume.\n\n";
        }

        // Contact Information
        $contactScore = 0;
        $contactInfo = [];
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Email address found";
        } else {
            $contactInfo[] = "❌ No email address found";
        }
        if (preg_match('/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Phone number found";
        } else {
            $contactInfo[] = "❌ No phone number found";
        }
        if (preg_match('/(street|avenue|road|drive|lane|boulevard|city|state|zip|postal)/i', $text)) {
            $contactScore += 5;
            $contactInfo[] = "✅ Address information found";
        } else {
            $contactInfo[] = "❌ No address information found";
        }
        $score += $contactScore;
        $feedback[] = "📞 Contact Information: {$contactScore}/15 points\n" . implode("\n", $contactInfo);

        // Education
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
        $degreeTypes = ['bachelor', 'master', 'phd', 'associate', 'diploma'];
        $degreeCount = 0;
        foreach ($degreeTypes as $degree) {
            if (str_contains($text, $degree)) {
                $degreeCount++;
            }
        }
        if ($degreeCount > 0) {
            $educationScore += min(5, $degreeCount * 2);
            $educationInfo[] = "✅ Found {$degreeCount} degree(s) mentioned";
        }
        $score += $educationScore;
        $feedback[] = "🎓 Education: {$educationScore}/20 points\n" . implode("\n", $educationInfo);

        // Work Experience
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

        // Skills
        $skillsScore = 0;
        $skillsInfo = [];
        if (str_contains($text, 'skills') || str_contains($text, 'competencies') || str_contains($text, 'abilities')) {
            $skillsScore += 10;
            $skillsInfo[] = "✅ Skills section found";
        } else {
            $skillsInfo[] = "❌ No skills section found";
        }
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

        // Professional Summary
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

        // Document Structure
        $structureScore = 0;
        $structureInfo = [];
        if ($wordCount >= 200 && $wordCount <= 1000) {
            $structureScore += 5;
            $structureInfo[] = "✅ Appropriate document length ({$wordCount} words)";
        } else {
            $structureInfo[] = "⚠️ Document length may need adjustment ({$wordCount} words)";
        }
        if ($paragraphCount >= 5) {
            $structureScore += 5;
            $structureInfo[] = "✅ Good document structure ({$paragraphCount} paragraphs)";
        } else {
            $structureInfo[] = "⚠️ Document structure could be improved ({$paragraphCount} paragraphs)";
        }
        $score += $structureScore;
        $feedback[] = "📋 Document Structure: {$structureScore}/10 points\n" . implode("\n", $structureInfo);

        // Final Rating
        $percentage = round(($score / $maxScore) * 100);
        $rating = $this->getRatingLevel($percentage);

        return "📋 CV/Resume Analysis & Rating\n\n" .
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
            $recommendations[] = "• Ensure contact information includes email, phone, and address.";
        }
        if ($percentage < 70) {
            $recommendations[] = "• Add a clear education section with degree details and institutions.";
        }
        if ($percentage < 75) {
            $recommendations[] = "• Expand work experience with specific job titles, roles, and achievements.";
        }
        if ($percentage < 70) {
            $recommendations[] = "• Include a comprehensive skills section with relevant technical and soft skills.";
        }
        if ($percentage < 60) {
            $recommendations[] = "• Add a professional summary or objective to highlight your career goals.";
        }
        if (empty($recommendations)) {
            $recommendations[] = "• Excellent work! Your CV is well-structured and comprehensive.";
        }

        return implode("\n", $recommendations);
    }

    private function processMessage($message)
    {
        $message = strtolower(trim($message));

        if (preg_match('/total\\s+salar(y|ies)|salary\\s+total|sum\\s+salar(y|ies)|overall\\s+salar(y|ies)/i', $message)) {
            $totalSalaries = SalarySummary::sum('final_salary');
            return "💰 Total salaries: " . number_format($totalSalaries, 2) . " EGP";
        }

        // Define command patterns
        $commands = [
            'stats' => ['statistics', 'stats', 'overview', 'summary'],
            'employee' => ['employee', 'employer', 'staff', 'worker'],
            'department' => ['department', 'dept', 'division'],
            'holiday' => ['holiday', 'vacation', 'leave'],
            'attendance' => ['attendance', 'present', 'absent', 'check-in'],
            'salary' => ['salary', 'payroll', 'payment', 'wages'],
            'help' => ['help', 'assist', 'guide', 'commands'],
        ];

        // Check for specific commands
        if ($this->matchesCommand($message, $commands['stats'])) {
            return $this->getGeneralStats();
        }
        if ($this->matchesCommand($message, $commands['employee'])) {
            return $this->getEmployerInfo($message);
        }
        if ($this->matchesCommand($message, $commands['department'])) {
            return $this->getDepartmentInfo($message);
        }
        if ($this->matchesCommand($message, $commands['holiday'])) {
            return $this->getHolidayInfo($message);
        }
        if ($this->matchesCommand($message, $commands['attendance'])) {
            return $this->getAttendanceInfo($message);
        }
        if ($this->matchesCommand($message, $commands['salary'])) {
            return $this->getSalaryInfo($message);
        }
        if ($this->matchesCommand($message, $commands['help'])) {
            return $this->getHelp();
        }

        // Fallback for unclear or unsupported queries
        return "Sorry, I didn't understand your request. Here's what I can help with:\n" .
               "• 'statistics' for system stats\n" .
               "• 'employee [name]' for employee details\n" .
               "• 'department info' for department details\n" .
               "• 'upcoming holidays' for holiday info\n" .
               "• 'attendance for [name]' for attendance records\n" .
               "• 'total salaries' for salary info\n" .
               "• 'help' for all commands\n" .
               "Please clarify or try a different command.";
    }

    private function matchesCommand($message, $keywords)
    {
        foreach ($keywords as $keyword) {
            if (preg_match("/\b" . preg_quote($keyword, '/') . "\b/i", $message)) {
                return true;
            }
        }
        return false;
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
        if (preg_match('/\b(count|total|how many)\b/i', $message)) {
            $count = Employer::count();
            $activeCount = Employer::whereNotNull('contract_date')->count();
            return "📊 Employee Statistics:\n" .
                   "• Total Employees: {$count}\n" .
                   "• Active Employees: {$activeCount}";
        }

        if (preg_match('/\b(recent|new|latest)\b/i', $message)) {
            $recent = Employer::with('department')->latest()->take(5)->get();
            $response = "📅 Latest 5 employees added:\n";
            foreach ($recent as $employer) {
                $departmentName = $employer->department ? $employer->department->name : 'No Department';
                $response .= "• {$employer->full_name} - {$departmentName} (Phone: {$employer->phone})\n";
            }
            return $response ?: "No recent employees found.";
        }

        if (preg_match('/\b(list|all employees|show all)\b/i', $message)) {
            $employers = Employer::with('department')->take(10)->get();
            $response = "👥 First 10 employees:\n";
            foreach ($employers as $employer) {
                $departmentName = $employer->department ? $employer->department->name : 'No Department';
                $response .= "• {$employer->full_name} - {$departmentName}\n";
            }
            return $response ?: "No employees found.";
        }

        if (preg_match('/(?:employee|employer|staff|details for|info for|show me|find|search for)\s+([a-zA-Z0-9\s]+)/i', $message, $matches)) {
            $searchTerm = trim($matches[1]);

            // Avoid misinterpreting command keywords as names
            $commandWords = ['count', 'total', 'recent', 'new', 'latest', 'list', 'all', 'show'];
            if (in_array(strtolower($searchTerm), $commandWords)) {
                return $this->getEmployerHelp();
            }

            // Search by name or phone
            $employer = Employer::where('full_name', 'LIKE', "%{$searchTerm}%")
                ->orWhere('phone', 'LIKE', "%{$searchTerm}%")
                ->with('department')
                ->first();

            if ($employer) {
                $departmentName = $employer->department ? $employer->department->name : 'N/A';
                $salary = $employer->salary ? number_format($employer->salary, 2) . ' EGP' : 'N/A';
                return "👤 Employee Details for {$employer->full_name}:\n" .
                       "• Phone: {$employer->phone}\n" .
                       "• Department: {$departmentName}\n" .
                       "• Nationality: " . ($employer->nationality ? $employer->nationality : 'N/A') . "\n" .
                       "• Contract Date: " . ($employer->contract_date ? $employer->contract_date : 'N/A') . "\n" .
                       "• Salary: {$salary}\n" .
                       "• Gender: " . ($employer->gender ? $employer->gender : 'N/A') . "\n" .
                       "• Address: " . ($employer->address ? $employer->address : 'N/A');
            }

            // Suggest similar employees
            $similarEmployers = Employer::where('full_name', 'LIKE', "%{$searchTerm}%")
                ->orWhere('phone', 'LIKE', "%{$searchTerm}%")
                ->take(3)
                ->get(['full_name', 'phone']);

            if ($similarEmployers->count() > 0) {
                $response = "Sorry, I couldn't find an employee matching '{$searchTerm}'.\n\nDid you mean one of these?\n";
                foreach ($similarEmployers as $emp) {
                    $response .= "• {$emp->full_name} (Phone: {$emp->phone})\n";
                }
                return $response;
            }

            return "Sorry, I couldn't find any employee matching '{$searchTerm}'.\n\nTry:\n" .
                   "• 'employee count' for total employees\n" .
                   "• 'recent employees' for latest additions\n" .
                   "• Check the spelling or try searching by phone number";
        }

        return $this->getEmployerHelp();
    }

    private function getEmployerHelp()
    {
        return "I can help with employee information. Try:\n" .
               "• 'employee count' for total employees\n" .
               "• 'recent employees' for latest additions\n" .
               "• 'list employees' for the first 10 employees\n" .
               "• 'employee [name]' for specific employee details\n" .
               "• 'search for [phone]' to search by phone number";
    }

    private function getDepartmentInfo($message)
    {
        if (preg_match('/\b(in|employees in|staff in|who is in|in the)\s+([a-zA-Z\s]+)\s*(?:department)?/i', $message, $matches)) {
            $deptName = trim($matches[2]);
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
            }
            return "Sorry, I couldn't find a department named '{$deptName}'.";
        }

        if (preg_match('/\b(count|total|how many)\b/i', $message)) {
            $count = Department::count();
            return "Total number of departments: {$count}";
        }

        $departments = Department::withCount('employers')->get();
        $response = "🏢 Departments and employee count:\n";
        foreach ($departments as $dept) {
            $response .= "• {$dept->name}: {$dept->employers_count} employees\n";
        }
        return $response ?: "No departments found.";
    }

    private function getHolidayInfo($message)
    {
        if (preg_match('/\b(upcoming|next|future)\b/i', $message)) {
            $upcoming = Holiday::where('date', '>=', now())->orderBy('date')->take(5)->get();
            $response = "🏖️ Upcoming holidays:\n";
            foreach ($upcoming as $holiday) {
                $response .= "• {$holiday->name} - {$holiday->date->format('Y-m-d')}\n";
            }
            return $response ?: "No upcoming holidays found.";
        }

        if (preg_match('/\b(count|total|how many)\b/i', $message)) {
            $count = Holiday::count();
            return "Total number of holidays: {$count}";
        }

        $holidays = Holiday::orderBy('date', 'desc')->take(5)->get();
        $response = "🏖️ Recent holidays:\n";
        foreach ($holidays as $holiday) {
            $response .= "• {$holiday->name} - {$holiday->date->format('Y-m-d')}\n";
        }
        return $response . "\nType 'upcoming holidays' to see future holidays.";
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
                    return "✅ {$employer->full_name} was present today at {$todayAttendance->created_at->format('H:i:s')}.";
                }
                return "❌ {$employer->full_name} was not marked present today.";
            }
            return "Sorry, I couldn't find an employee named '{$name}'.";
        }

        if (preg_match('/\b(today|current)\b/i', $message)) {
            $today = Attendance::whereDate('created_at', today())->count();
            return "Today's attendance count: {$today}";
        }

        if (preg_match('/\b(this month|monthly)\b/i', $message)) {
            $thisMonth = Attendance::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
            return "This month's attendance count: {$thisMonth}";
        }

        return "I can help with attendance information. Try:\n" .
               "• 'today attendance' for today's count\n" .
               "• 'this month attendance' for monthly count\n" .
               "• 'attendance for [name] today' to check a specific employee";
    }

    private function getSalaryInfo($message)
    {
        if (preg_match('/\b(total|sum|overall)\b/i', $message)) {
            $totalSalaries = SalarySummary::sum('final_salary');
            return "💰 Total salaries: " . number_format($totalSalaries, 2) . " EGP";
        }

        if (preg_match('/(?:salary for|pay for)\s+(.+)/i', $message, $matches)) {
            $name = trim($matches[1]);
            $employer = Employer::where('full_name', 'LIKE', "%{$name}%")->first();
            if ($employer) {
                $salary = $employer->salary ? number_format($employer->salary, 2) . ' EGP' : 'N/A';
                return "💰 Salary for {$employer->full_name}: {$salary}";
            }
            return "Sorry, I couldn't find an employee named '{$name}'.";
        }

        return "I can help with salary information. Try:\n" .
               "• 'total salaries' for total salary amount\n" .
               "• 'salary for [name]' for a specific employee's salary";
    }

    private function getHelp()
    {
        return "🤖 HR AI Assistant Commands:\n\n" .
               "📊 Statistics\n" .
               "   - 'statistics' or 'stats': Show system overview.\n\n" .
               "👥 Employees\n" .
               "   - 'employee count': Total number of employees.\n" .
               "   - 'recent employees': List newest employees.\n" .
               "   - 'list employees': Show first 10 employees.\n" .
               "   - 'employee [name]': Details for a specific employee.\n" .
               "   - 'search for [phone]': Search by phone number.\n\n" .
               "🏢 Departments\n" .
               "   - 'department info': List all departments and employee counts.\n" .
               "   - 'employees in [department name]': List employees in a department.\n\n" .
               "🏖️ Holidays\n" .
               "   - 'upcoming holidays': Show upcoming holidays.\n" .
               "   - 'holiday count': Total number of holidays.\n\n" .
               "⏰ Attendance\n" .
               "   - 'today attendance': Today's attendance count.\n" .
               "   - 'this month attendance': Monthly attendance count.\n" .
               "   - 'attendance for [name] today': Check employee's attendance.\n\n" .
               "💰 Salaries\n" .
               "   - 'total salaries': Total salary amount.\n" .
               "   - 'salary for [name]': Specific employee's salary.\n\n" .
               "📄 PDF Upload\n" .
               "   - Upload a CV for analysis via the upload button.";
    }
}