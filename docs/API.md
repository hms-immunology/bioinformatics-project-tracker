# API Documentation

This document provides detailed information about the internal APIs, component interfaces, and data structures used in the Bioinformatics Project Tracker.

## Table of Contents
- [Data Structures](#data-structures)
- [Component APIs](#component-apis)
- [Utility Functions](#utility-functions)
- [Storage API](#storage-api)
- [Export Functions](#export-functions)

## Data Structures

### Project Object
```typescript
interface Project {
  id: number;                    // Unique identifier
  name: string;                  // Project name
  stage: string;                 // Current project stage
  progress: number;              // Progress percentage (0-100)
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  startDate: string;             // ISO date string
  dueDate: string;               // ISO date string
  description: string;           // Project description
  completedSteps: Step[];        // Array of completed steps
  nextSteps: Step[];             // Array of planned steps
  attachments: Attachment[];     // Array of file attachments
  tags: string[];               // Array of project tags
  timeTracked: number;          // Total time in seconds
}
```

### Step Object
```typescript
interface Step {
  text: string;                 // Step description
  category: 'Lab Work' | 'Analysis' | 'Documentation' | 'Review' | 'Other';
}
```

### Attachment Object
```typescript
interface Attachment {
  id: number;                   // Unique identifier
  name: string;                 // File name
  size: number;                 // File size in bytes
  type: string;                 // MIME type
  uploadDate: string;           // ISO date string
}
```

### Template Object
```typescript
interface Template {
  category: string;             // Template category
  steps: Step[];               // Predefined steps
}
```

## Component APIs

### BioinformaticsTracker (Main Component)

The root component that manages the entire application state.

#### Props
No props (root component)

#### State
```typescript
const [projects, setProjects] = useState<Project[]>([]);
const [currentView, setCurrentView] = useState<'projects' | 'dashboard' | 'analytics'>('projects');
const [darkMode, setDarkMode] = useState<boolean>(false);
const [showForm, setShowForm] = useState<boolean>(false);
const [editingProject, setEditingProject] = useState<Project | null>(null);
const [searchTerm, setSearchTerm] = useState<string>('');
const [filterStage, setFilterStage] = useState<string>('');
const [filterPriority, setFilterPriority] = useState<string>('');
const [filterTags, setFilterTags] = useState<any[]>([]);
const [formData, setFormData] = useState<Project>(initialFormData);
```

#### Key Methods
- `handleSubmit()` - Saves or updates a project
- `handleEdit(project)` - Opens edit form for a project
- `handleDelete(id)` - Removes a project
- `handleDragEnd(event)` - Handles project reordering

### SortableProjectCard

Displays individual project information with drag-and-drop functionality.

#### Props
```typescript
interface SortableProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  darkMode: boolean;
}
```

#### Features
- Drag-and-drop reordering
- Progress visualization
- Priority indicators
- Due date and time remaining
- Tag display
- Time tracking information

### Dashboard

Provides overview analytics and key metrics.

#### Props
```typescript
interface DashboardProps {
  projects: Project[];
  darkMode: boolean;
}
```

#### Metrics Displayed
- Total projects count
- Completed projects count
- High priority projects count
- Overdue projects count
- Progress distribution charts
- Priority distribution pie chart

### AdvancedAnalytics

Detailed analytics with smart suggestions and exports.

#### Props
```typescript
interface AdvancedAnalyticsProps {
  projects: Project[];
  darkMode: boolean;
}
```

#### Features
- Advanced metrics calculation
- Time series visualization
- Smart suggestions engine
- Export functionality (PDF/Word)

### TimeTracker

Time tracking component for individual projects.

#### Props
```typescript
interface TimeTrackerProps {
  project: Project;
  onTimeUpdate: (timeTracked: number) => void;
  darkMode: boolean;
}
```

#### State
```typescript
const [isTracking, setIsTracking] = useState<boolean>(false);
const [currentSession, setCurrentSession] = useState<number>(0);
const [totalTime, setTotalTime] = useState<number>(project.timeTracked || 0);
```

### TemplateSelector

Provides pre-built workflow templates.

#### Props
```typescript
interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  darkMode: boolean;
}
```

#### Available Templates
- RNA-seq Analysis (15 steps)
- Genome Assembly (14 steps)
- Variant Calling (13 steps)
- Metagenomics (14 steps)

### FileAttachments

Manages file attachments for projects.

#### Props
```typescript
interface FileAttachmentsProps {
  attachments: Attachment[];
  onAdd: (attachment: Attachment) => void;
  onRemove: (attachmentId: number) => void;
  darkMode: boolean;
}
```

#### Supported File Types
- Documents: .pdf, .doc, .docx, .txt
- Data files: .csv, .xlsx
- Images: .png, .jpg, .jpeg

### AdvancedSearchFilter

Enhanced search and filtering interface.

#### Props
```typescript
interface AdvancedSearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStage: string;
  setFilterStage: (stage: string) => void;
  filterPriority: string;
  setFilterPriority: (priority: string) => void;
  filterTags: any[];
  setFilterTags: (tags: any[]) => void;
  availableTags: string[];
  stages: string[];
  priorities: string[];
  darkMode: boolean;
}
```

## Utility Functions

### Date Utilities
```typescript
// Format time duration from seconds
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Get days remaining until due date
const getDaysRemaining = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Format file size from bytes
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
```

### Analytics Functions
```typescript
// Generate project insights
const generateProjectInsights = (projects: Project[]) => {
  return {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.progress === 100).length,
    averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
    projectsByStage: groupByStage(projects),
    projectsByPriority: groupByPriority(projects),
    upcomingDeadlines: getUpcomingDeadlines(projects),
    overdueProjects: getOverdueProjects(projects),
    timeMetrics: calculateTimeMetrics(projects)
  };
};

// Generate smart suggestions
const generateSmartSuggestions = (projects: Project[], currentProject?: Project) => {
  // Returns array of suggestion objects with type, priority, title, description, and action
};
```

### Color Utilities
```typescript
// Get progress bar color based on percentage
const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 60) return 'bg-blue-500';
  if (progress >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
};

// Get priority badge colors
const getPriorityColor = (priority: string, darkMode: boolean): string => {
  const colors = {
    Critical: darkMode ? 'bg-red-900 text-red-200 border-red-800' : 'bg-red-100 text-red-800 border-red-200',
    High: darkMode ? 'bg-orange-900 text-orange-200 border-orange-800' : 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: darkMode ? 'bg-blue-900 text-blue-200 border-blue-800' : 'bg-blue-100 text-blue-800 border-blue-200',
    Low: darkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[priority] || colors.Low;
};
```

## Storage API

### Local Storage Functions
```typescript
// Save projects to localStorage
const saveProjects = (projects: Project[]): void => {
  localStorage.setItem('bioinf-projects', JSON.stringify(projects));
};

// Load projects from localStorage
const loadProjects = (): Project[] => {
  const saved = localStorage.getItem('bioinf-projects');
  return saved ? JSON.parse(saved) : [];
};

// Save dark mode preference
const saveDarkMode = (darkMode: boolean): void => {
  localStorage.setItem('bioinf-dark-mode', JSON.stringify(darkMode));
};

// Load dark mode preference
const loadDarkMode = (): boolean => {
  const saved = localStorage.getItem('bioinf-dark-mode');
  return saved ? JSON.parse(saved) : false;
};
```

### Data Migration
```typescript
// Migrate old data format to new format
const migrateData = (oldData: any[]): Project[] => {
  return oldData.map(project => ({
    ...project,
    attachments: project.attachments || [],
    tags: project.tags || [],
    timeTracked: project.timeTracked || 0,
    completedSteps: normalizeSteps(project.completedSteps || []),
    nextSteps: normalizeSteps(project.nextSteps || [])
  }));
};
```

## Export Functions

### PDF Export
```typescript
const exportToPDF = async (projects: Project[], insights: any): Promise<void> => {
  const pdf = new jsPDF();
  
  // Add title and metadata
  pdf.setFontSize(20);
  pdf.text('Bioinformatics Project Report', 20, 30);
  pdf.setFontSize(12);
  pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, 45);
  
  // Add project summaries
  // ... PDF generation logic
  
  pdf.save('bioinformatics-projects-report.pdf');
};
```

### Word Export
```typescript
const exportToWord = async (projects: Project[], insights: any): Promise<void> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Bioinformatics Project Report",
          heading: HeadingLevel.TITLE,
        }),
        // ... document structure
      ],
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "bioinformatics-projects-report.docx");
};
```

## Constants

### Predefined Values
```typescript
const STAGES = [
  'Planning', 'Data Collection', 'Quality Control', 'Data Processing',
  'Analysis', 'Assembly', 'Annotation', 'Visualization', 'Validation', 'Complete'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const STEP_CATEGORIES = ['Lab Work', 'Analysis', 'Documentation', 'Review', 'Other'];

const COMMON_STEPS = [
  'Sample Collection', 'DNA/RNA Extraction', 'Quality Control', 'Library Preparation',
  'Sequencing', 'Data Processing', 'Statistical Analysis', 'Visualization',
  'Report Generation', 'Manuscript Preparation', 'Peer Review', 'Data Submission'
];
```

## Event Handlers

### Drag and Drop
```typescript
// Handle project card reordering
const handleDragEnd = (event: DragEndEvent): void => {
  const { active, over } = event;
  if (active.id !== over.id) {
    setProjects((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
};

// Handle step reordering within forms
const handleStepDragEnd = (result: any, stepType: string): void => {
  if (!result.destination) return;
  const items = Array.from(formData[stepType]);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);
  setFormData({ ...formData, [stepType]: items });
};
```

## Error Handling

### Common Error Patterns
```typescript
// Graceful error handling for file operations
const handleFileError = (error: Error): void => {
  console.error('File operation failed:', error);
  // Show user-friendly error message
};

// Data validation
const validateProject = (project: Project): string[] => {
  const errors: string[] = [];
  if (!project.name.trim()) errors.push('Project name is required');
  if (project.progress < 0 || project.progress > 100) errors.push('Progress must be between 0 and 100');
  if (project.startDate && project.dueDate && new Date(project.startDate) > new Date(project.dueDate)) {
    errors.push('Start date cannot be after due date');
  }
  return errors;
};
```

This API documentation provides a comprehensive overview of the internal structure and interfaces used throughout the Bioinformatics Project Tracker. Use this as a reference when contributing to the project or integrating with external systems. 