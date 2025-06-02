import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, CheckCircle, GripVertical, Search, Filter, BarChart3, Grid3X3, Moon, Sun, TrendingUp, Target, AlertCircle, Upload, FileText, Link, Tag, Users, History, ChevronDown, ChevronRight, Download, PlayCircle, PauseCircle, StopCircle, Brain, Lightbulb, Timer, Activity } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } from 'docx';
import { saveAs } from 'file-saver';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

// Step Templates and Suggestions
const BIOINFORMATICS_TEMPLATES = {
  'RNA-seq Analysis': {
    category: 'Analysis',
    steps: [
      { text: 'Sample Collection', category: 'Lab Work' },
      { text: 'RNA Extraction', category: 'Lab Work' },
      { text: 'Quality Control (Bioanalyzer)', category: 'Lab Work' },
      { text: 'Library Preparation', category: 'Lab Work' },
      { text: 'Sequencing', category: 'Lab Work' },
      { text: 'FastQC Quality Assessment', category: 'Analysis' },
      { text: 'Read Trimming and Filtering', category: 'Analysis' },
      { text: 'Genome Alignment', category: 'Analysis' },
      { text: 'Read Counting', category: 'Analysis' },
      { text: 'Differential Expression Analysis', category: 'Analysis' },
      { text: 'Pathway Enrichment Analysis', category: 'Analysis' },
      { text: 'Data Visualization', category: 'Analysis' },
      { text: 'Statistical Validation', category: 'Analysis' },
      { text: 'Report Generation', category: 'Documentation' },
      { text: 'Manuscript Preparation', category: 'Documentation' }
    ]
  },
  'Genome Assembly': {
    category: 'Analysis',
    steps: [
      { text: 'DNA Extraction', category: 'Lab Work' },
      { text: 'Quality Assessment', category: 'Lab Work' },
      { text: 'Library Preparation', category: 'Lab Work' },
      { text: 'Sequencing (PacBio/Nanopore)', category: 'Lab Work' },
      { text: 'Raw Data Quality Control', category: 'Analysis' },
      { text: 'Read Error Correction', category: 'Analysis' },
      { text: 'Genome Assembly', category: 'Analysis' },
      { text: 'Assembly Quality Assessment', category: 'Analysis' },
      { text: 'Scaffolding', category: 'Analysis' },
      { text: 'Gap Filling', category: 'Analysis' },
      { text: 'Genome Annotation', category: 'Analysis' },
      { text: 'Functional Annotation', category: 'Analysis' },
      { text: 'Comparative Genomics', category: 'Analysis' },
      { text: 'Assembly Report', category: 'Documentation' }
    ]
  },
  'Variant Calling': {
    category: 'Analysis',
    steps: [
      { text: 'Sample Preparation', category: 'Lab Work' },
      { text: 'WGS/WES Sequencing', category: 'Lab Work' },
      { text: 'Raw Data QC', category: 'Analysis' },
      { text: 'Read Alignment', category: 'Analysis' },
      { text: 'Duplicate Removal', category: 'Analysis' },
      { text: 'Base Quality Recalibration', category: 'Analysis' },
      { text: 'Variant Calling', category: 'Analysis' },
      { text: 'Variant Filtering', category: 'Analysis' },
      { text: 'Variant Annotation', category: 'Analysis' },
      { text: 'Functional Impact Prediction', category: 'Analysis' },
      { text: 'Population Frequency Analysis', category: 'Analysis' },
      { text: 'Clinical Interpretation', category: 'Analysis' },
      { text: 'Report Generation', category: 'Documentation' }
    ]
  },
  'Metagenomics': {
    category: 'Analysis',
    steps: [
      { text: 'Sample Collection', category: 'Lab Work' },
      { text: 'DNA Extraction', category: 'Lab Work' },
      { text: 'Library Preparation', category: 'Lab Work' },
      { text: 'Shotgun Sequencing', category: 'Lab Work' },
      { text: 'Quality Control', category: 'Analysis' },
      { text: 'Host DNA Removal', category: 'Analysis' },
      { text: 'Taxonomic Classification', category: 'Analysis' },
      { text: 'Functional Annotation', category: 'Analysis' },
      { text: 'Diversity Analysis', category: 'Analysis' },
      { text: 'Differential Abundance', category: 'Analysis' },
      { text: 'Pathway Analysis', category: 'Analysis' },
      { text: 'Visualization', category: 'Analysis' },
      { text: 'Statistical Analysis', category: 'Analysis' },
      { text: 'Report Writing', category: 'Documentation' }
    ]
  }
};

const STEP_CATEGORIES = ['Lab Work', 'Analysis', 'Documentation', 'Review', 'Other'];

const COMMON_STEPS = [
  'Sample Collection', 'DNA/RNA Extraction', 'Quality Control', 'Library Preparation',
  'Sequencing', 'Data Processing', 'Statistical Analysis', 'Visualization',
  'Report Generation', 'Manuscript Preparation', 'Peer Review', 'Data Submission'
];

// Enhanced Step Component with Drag and Drop
const DraggableStep = ({ step, index, onUpdate, onRemove, darkMode, suggestions, onSuggestionSelect }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [localValue, setLocalValue] = useState(step.text || '');

  const filteredSuggestions = suggestions.filter(s => 
    s.toLowerCase().includes(localValue.toLowerCase()) && s !== localValue
  ).slice(0, 5);

  const handleSave = () => {
    onUpdate(index, { ...step, text: localValue });
    setIsEditing(false);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setLocalValue(suggestion);
    onUpdate(index, { ...step, text: suggestion });
    setShowSuggestions(false);
    setIsEditing(false);
  };

  const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <Draggable draggableId={`step-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`relative ${snapshot.isDragging ? 'z-50' : ''}`}
        >
          <div className={`flex items-center gap-2 p-3 border rounded-lg ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}>
            <div {...provided.dragHandleProps} className={`cursor-grab ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <GripVertical size={16} />
            </div>
            
            <div className="flex-1 relative">
              {isEditing ? (
                <div className="relative">
                  <input
                    type="text"
                    value={localValue}
                    onChange={(e) => {
                      setLocalValue(e.target.value);
                      setShowSuggestions(e.target.value.length > 0);
                    }}
                    onBlur={() => {
                      setTimeout(() => {
                        handleSave();
                      }, 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') {
                        setLocalValue(step.text || '');
                        setIsEditing(false);
                        setShowSuggestions(false);
                      }
                    }}
                    className={inputClass}
                    autoFocus
                  />
                  
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className={`absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 ${
                      darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                    }`}>
                      {filteredSuggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full text-left px-3 py-2 hover:bg-opacity-50 ${
                            darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'
                          } ${i === 0 ? 'rounded-t-lg' : ''} ${i === filteredSuggestions.length - 1 ? 'rounded-b-lg' : ''}`}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => setIsEditing(true)}
                  className={`cursor-text p-2 rounded ${darkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-100 text-gray-900'}`}
                >
                  {step.text || 'Click to edit step'}
                </div>
              )}
            </div>

            <select
              value={step.category || 'Other'}
              onChange={(e) => onUpdate(index, { ...step, category: e.target.value })}
              className={`text-sm px-2 py-1 border rounded ${
                darkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {STEP_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <button
              onClick={() => onRemove(index)}
              className={`p-1 rounded hover:bg-opacity-50 ${
                darkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-500 hover:bg-red-100'
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </Draggable>
  );
};

// Template Selector Component
const TemplateSelector = ({ onSelectTemplate, darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-2 ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FileText size={16} />
        Use Template
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-64 border rounded-lg shadow-lg z-50 ${
          darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <div className={`p-2 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <h4 className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Bioinformatics Templates
            </h4>
          </div>
          
          {Object.entries(BIOINFORMATICS_TEMPLATES).map(([name, template]) => (
            <button
              key={name}
              onClick={() => {
                onSelectTemplate(template);
                setIsOpen(false);
              }}
              className={`w-full text-left p-3 hover:bg-opacity-50 ${
                darkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="font-medium">{name}</div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {template.steps.length} steps
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Timeline Visualization Component
const ProjectTimeline = ({ project, darkMode }) => {
  if (!project.startDate || !project.dueDate) {
    return (
      <div className={`p-4 border rounded-lg ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Add start and due dates to see timeline
        </p>
      </div>
    );
  }

  const startDate = new Date(project.startDate);
  const dueDate = new Date(project.dueDate);
  const today = new Date();
  const totalDays = differenceInDays(dueDate, startDate);
  const elapsedDays = Math.max(0, differenceInDays(today, startDate));
  const progressPercentage = Math.min(100, (elapsedDays / totalDays) * 100);

  const stages = [
    { name: 'Planning', percentage: 10 },
    { name: 'Data Collection', percentage: 20 },
    { name: 'Analysis', percentage: 50 },
    { name: 'Documentation', percentage: 20 }
  ];

  let currentPosition = 0;

  return (
    <div className={`p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        Project Timeline
      </h4>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {format(startDate, 'MMM dd, yyyy')}
          </span>
          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            {format(dueDate, 'MMM dd, yyyy')}
          </span>
        </div>
        
        <div className="relative">
          <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between">
            {stages.map((stage, index) => {
              const position = currentPosition;
              currentPosition += stage.percentage;
              
              return (
                <div key={stage.name} className="text-center" style={{ marginLeft: `${position}%` }}>
                  <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {stage.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-sm">
          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            Progress: {Math.round(progressPercentage)}%
          </span>
          <span className={`ml-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            ({elapsedDays} of {totalDays} days)
          </span>
        </div>
      </div>
    </div>
  );
};

// File Attachment Component
const FileAttachments = ({ attachments = [], onAdd, onRemove, darkMode }) => {
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const attachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date().toISOString()
      };
      onAdd(attachment);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          File Attachments
        </label>
        <label className={`cursor-pointer px-3 py-1 border rounded-lg text-sm flex items-center gap-2 ${
          darkMode 
            ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' 
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}>
          <Upload size={14} />
          Add Files
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
          />
        </label>
      </div>

      <div className="space-y-2">
        {attachments.map((file) => (
          <div key={file.id} className={`flex items-center justify-between p-2 border rounded-lg ${
            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-center gap-2">
              <FileText size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
              <div>
                <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {file.name}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {formatFileSize(file.size)} • {format(new Date(file.uploadDate), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onRemove(file.id)}
              className={`p-1 rounded hover:bg-opacity-50 ${
                darkMode ? 'text-red-400 hover:bg-red-900' : 'text-red-500 hover:bg-red-100'
              }`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        
        {attachments.length === 0 && (
          <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No files attached. Click "Add Files" to upload documents, protocols, or data files.
          </div>
        )}
      </div>
    </div>
  );
};

// Sortable Project Card Component
const SortableProjectCard = ({ project, onEdit, onDelete, darkMode }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority) => {
    if (darkMode) {
      switch (priority) {
        case 'Critical': return 'bg-red-900 text-red-200 border-red-800';
        case 'High': return 'bg-orange-900 text-orange-200 border-orange-800';
        case 'Medium': return 'bg-blue-900 text-blue-200 border-blue-800';
        case 'Low': return 'bg-gray-700 text-gray-300 border-gray-600';
        default: return 'bg-gray-700 text-gray-300 border-gray-600';
      }
    } else {
      switch (priority) {
        case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
        case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Low': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
  };

  const getDaysRemaining = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(project.dueDate);

  const cardClass = `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border ${isDragging ? 'shadow-lg' : ''}`;
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';
  const gripColor = darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600';

  return (
    <div ref={setNodeRef} style={style} className={cardClass}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing ${gripColor} mt-1`}
          >
            <GripVertical size={16} />
          </div>
          <div className="flex-1">
            <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>{project.name}</h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(project.priority)}`}>
              {project.priority} Priority
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(project)}
            className={`${darkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-600'} transition-colors`}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className={`${darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'} transition-colors`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${textSecondary}`}>Current Stage</span>
            <span className="text-sm text-blue-500 font-medium">{project.stage}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium ${textSecondary}`}>Progress</span>
            <span className={`text-sm font-medium ${textPrimary}`}>{project.progress}%</span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2`}>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </div>

        <div className={`flex items-center gap-4 text-sm ${textSecondary}`}>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
          <div className={`flex items-center gap-1 ${daysRemaining < 7 ? 'text-red-500' : daysRemaining < 14 ? 'text-yellow-500' : 'text-green-500'}`}>
            <Clock size={14} />
            <span>{daysRemaining} days</span>
          </div>
        </div>

        {project.description && (
          <p className={`text-sm ${textSecondary} mt-3`}>{project.description}</p>
        )}

        {/* Project Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    darkMode 
                      ? 'bg-blue-900 text-blue-200 border border-blue-800' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {project.tags.length > 3 && (
                <span className={`text-xs ${textSecondary}`}>
                  +{project.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Time Tracking Info */}
        {project.timeTracked && project.timeTracked > 0 && (
          <div className={`mt-3 text-xs ${textSecondary} flex items-center gap-1`}>
            <Timer size={12} />
            <span>
              {Math.floor(project.timeTracked / 3600)}h {Math.floor((project.timeTracked % 3600) / 60)}m tracked
            </span>
          </div>
        )}

        {project.completedSteps.length > 0 && (
          <div>
            <h4 className={`text-sm font-medium ${textSecondary} mb-2 flex items-center gap-1`}>
              <CheckCircle size={14} className="text-green-500" />
              Completed Steps
            </h4>
            <ul className={`text-sm ${textSecondary} space-y-1`}>
              {project.completedSteps.slice(0, 3).map((step, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  {typeof step === 'string' ? step : step.text}
                </li>
              ))}
              {project.completedSteps.length > 3 && (
                <li className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-xs`}>+{project.completedSteps.length - 3} more</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Analytics Component
const Dashboard = ({ projects, darkMode }) => {
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.progress === 100).length;
  const highPriorityProjects = projects.filter(p => p.priority === 'High' || p.priority === 'Critical').length;
  const overdueProjects = projects.filter(p => {
    const today = new Date();
    const due = new Date(p.dueDate);
    return due < today && p.progress < 100;
  }).length;

  const progressData = [
    { name: 'Planning', value: projects.filter(p => p.stage === 'Planning').length },
    { name: 'In Progress', value: projects.filter(p => p.stage !== 'Planning' && p.stage !== 'Complete').length },
    { name: 'Complete', value: projects.filter(p => p.stage === 'Complete').length },
  ];

  const priorityData = [
    { name: 'Low', value: projects.filter(p => p.priority === 'Low').length, color: '#10B981' },
    { name: 'Medium', value: projects.filter(p => p.priority === 'Medium').length, color: '#3B82F6' },
    { name: 'High', value: projects.filter(p => p.priority === 'High').length, color: '#F59E0B' },
    { name: 'Critical', value: projects.filter(p => p.priority === 'Critical').length, color: '#EF4444' },
  ];

  const stageData = projects.reduce((acc, project) => {
    const existing = acc.find(item => item.stage === project.stage);
    if (existing) {
      existing.count += 1;
      existing.avgProgress = (existing.avgProgress + project.progress) / 2;
    } else {
      acc.push({ stage: project.stage, count: 1, avgProgress: project.progress });
    }
    return acc;
  }, []);

  const cardClass = `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`;
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Total Projects</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Completed</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{completedProjects}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>High Priority</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{highPriorityProjects}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Overdue</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{overdueProjects}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Distribution */}
        <div className={cardClass}>
          <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stage Progress */}
        <div className={cardClass}>
          <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>Progress by Stage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Enhanced Search and Filter Component with Tags
const AdvancedSearchFilter = ({ 
  searchTerm, setSearchTerm, 
  filterStage, setFilterStage, 
  filterPriority, setFilterPriority,
  filterTags, setFilterTags,
  availableTags,
  stages, priorities, darkMode 
}) => {
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      borderColor: darkMode ? '#4B5563' : '#D1D5DB',
      color: darkMode ? '#ffffff' : '#111827',
      minHeight: '38px'
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#374151' : '#ffffff',
      border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused 
        ? (darkMode ? '#4B5563' : '#F3F4F6')
        : (darkMode ? '#374151' : '#ffffff'),
      color: darkMode ? '#ffffff' : '#111827'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: darkMode ? '#4B5563' : '#E5E7EB'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#111827'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: darkMode ? '#ffffff' : '#111827',
      ':hover': {
        backgroundColor: darkMode ? '#EF4444' : '#FEE2E2',
        color: darkMode ? '#ffffff' : '#DC2626'
      }
    })
  };

  const inputClass = `px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
  }`;

  const tagOptions = availableTags.map(tag => ({ value: tag, label: tag }));
  
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search projects, descriptions, or steps..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`${inputClass} pl-10 w-full`}
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className={inputClass}
        >
          <option value="">All Stages</option>
          {stages.map(stage => (
            <option key={stage} value={stage}>{stage}</option>
          ))}
        </select>
        
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className={inputClass}
        >
          <option value="">All Priorities</option>
          {priorities.map(priority => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </select>

        {/* Tags Multi-Select */}
        <div className="lg:col-span-2">
          <Select
            isMulti
            options={tagOptions}
            value={filterTags}
            onChange={setFilterTags}
            placeholder="Filter by tags..."
            styles={selectStyles}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>
    </div>
  );
};

// Time Tracking Component
const TimeTracker = ({ project, onTimeUpdate, darkMode }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(0);
  const [totalTime, setTotalTime] = useState(project.timeTracked || 0);

  useEffect(() => {
    let interval;
    if (isTracking) {
      interval = setInterval(() => {
        setCurrentSession(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    setCurrentSession(0);
  };

  const stopTracking = () => {
    setIsTracking(false);
    const newTotal = totalTime + currentSession;
    setTotalTime(newTotal);
    onTimeUpdate(newTotal);
    setCurrentSession(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`p-3 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          Time Tracking
        </span>
        <div className="flex items-center gap-2">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
            >
              <PlayCircle size={12} />
              Start
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
            >
              <StopCircle size={12} />
              Stop
            </button>
          )}
        </div>
      </div>
      
      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div>Session: {formatTime(currentSession)}</div>
        <div>Total: {formatTime(totalTime + currentSession)}</div>
      </div>
    </div>
  );
};

// Enhanced Analytics and Time Tracking
const generateProjectInsights = (projects) => {
  const insights = {
    totalProjects: projects.length,
    completedProjects: projects.filter(p => p.progress === 100).length,
    averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length,
    projectsByStage: {},
    projectsByPriority: {},
    upcomingDeadlines: [],
    overdueProjects: [],
    timeMetrics: {
      averageProjectDuration: 0,
      completedOnTime: 0,
      averageStepsPerProject: 0
    }
  };

  const today = new Date();
  
  projects.forEach(project => {
    // Stage analysis
    insights.projectsByStage[project.stage] = (insights.projectsByStage[project.stage] || 0) + 1;
    
    // Priority analysis
    insights.projectsByPriority[project.priority] = (insights.projectsByPriority[project.priority] || 0) + 1;
    
    // Deadline analysis
    if (project.dueDate) {
      const dueDate = new Date(project.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);
      
      if (daysUntilDue < 0 && project.progress < 100) {
        insights.overdueProjects.push({
          ...project,
          daysOverdue: Math.abs(daysUntilDue)
        });
      } else if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        insights.upcomingDeadlines.push({
          ...project,
          daysUntilDue
        });
      }
    }
    
    // Time metrics
    if (project.startDate && project.dueDate) {
      const duration = differenceInDays(new Date(project.dueDate), new Date(project.startDate));
      insights.timeMetrics.averageProjectDuration += duration;
    }
    
    insights.timeMetrics.averageStepsPerProject += (project.completedSteps?.length || 0) + (project.nextSteps?.length || 0);
  });
  
  insights.timeMetrics.averageProjectDuration = Math.round(insights.timeMetrics.averageProjectDuration / projects.length) || 0;
  insights.timeMetrics.averageStepsPerProject = Math.round(insights.timeMetrics.averageStepsPerProject / projects.length) || 0;
  
  return insights;
};

// Smart Suggestions Engine
const generateSmartSuggestions = (projects, currentProject = null) => {
  const suggestions = [];
  const today = new Date();
  
  // Project-specific suggestions
  if (currentProject) {
    // Progress-based suggestions
    if (currentProject.progress === 0) {
      suggestions.push({
        type: 'action',
        priority: 'high',
        title: 'Get Started',
        description: 'Begin with the first step to build momentum',
        action: 'start_project'
      });
    } else if (currentProject.progress > 80 && currentProject.progress < 100) {
      suggestions.push({
        type: 'completion',
        priority: 'medium',
        title: 'Almost Done!',
        description: 'You\'re close to completion. Push through to finish',
        action: 'complete_project'
      });
    }
    
    // Deadline-based suggestions
    if (currentProject.dueDate) {
      const daysUntilDue = differenceInDays(new Date(currentProject.dueDate), today);
      if (daysUntilDue <= 3 && daysUntilDue > 0) {
        suggestions.push({
          type: 'urgency',
          priority: 'high',
          title: 'Deadline Approaching',
          description: `Only ${daysUntilDue} days left. Consider prioritizing this project`,
          action: 'increase_priority'
        });
      }
    }
    
    // Step-based suggestions
    if (currentProject.nextSteps?.length === 0) {
      suggestions.push({
        type: 'planning',
        priority: 'medium',
        title: 'Plan Next Steps',
        description: 'Add next steps to maintain project momentum',
        action: 'add_steps'
      });
    }
  }
  
  // Global suggestions
  const overdueCount = projects.filter(p => {
    if (!p.dueDate) return false;
    return differenceInDays(new Date(p.dueDate), today) < 0 && p.progress < 100;
  }).length;
  
  if (overdueCount > 0) {
    suggestions.push({
      type: 'alert',
      priority: 'high',
      title: 'Overdue Projects',
      description: `You have ${overdueCount} overdue project${overdueCount > 1 ? 's' : ''}`,
      action: 'review_overdue'
    });
  }
  
  // Productivity suggestions
  const stagnantProjects = projects.filter(p => {
    // Projects with no recent activity (simulated)
    return p.progress > 0 && p.progress < 90 && !p.lastActivity;
  });
  
  if (stagnantProjects.length > 0) {
    suggestions.push({
      type: 'productivity',
      priority: 'medium',
      title: 'Stagnant Projects',
      description: `${stagnantProjects.length} projects may need attention`,
      action: 'review_stagnant'
    });
  }
  
  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};

// Export functionality
const exportToPDF = async (projects, insights) => {
  const pdf = new jsPDF();
  
  // Title
  pdf.setFontSize(20);
  pdf.text('Bioinformatics Project Report', 20, 30);
  
  // Date
  pdf.setFontSize(12);
  pdf.text(`Generated: ${format(new Date(), 'MMMM dd, yyyy')}`, 20, 45);
  
  // Summary
  pdf.setFontSize(16);
  pdf.text('Project Summary', 20, 65);
  pdf.setFontSize(12);
  pdf.text(`Total Projects: ${insights.totalProjects}`, 20, 80);
  pdf.text(`Completed: ${insights.completedProjects}`, 20, 95);
  pdf.text(`Average Progress: ${Math.round(insights.averageProgress)}%`, 20, 110);
  
  // Projects list
  pdf.setFontSize(16);
  pdf.text('Projects', 20, 135);
  
  let yPosition = 150;
  pdf.setFontSize(10);
  
  projects.forEach((project, index) => {
    if (yPosition > 280) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.text(`${index + 1}. ${project.name}`, 20, yPosition);
    pdf.text(`Stage: ${project.stage}`, 30, yPosition + 10);
    pdf.text(`Progress: ${project.progress}%`, 30, yPosition + 20);
    pdf.text(`Priority: ${project.priority}`, 30, yPosition + 30);
    
    yPosition += 45;
  });
  
  pdf.save('bioinformatics-projects-report.pdf');
};

const exportToWord = async (projects, insights) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Bioinformatics Project Report",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: `Generated: ${format(new Date(), 'MMMM dd, yyyy')}`,
        }),
        new Paragraph({
          text: "Project Summary",
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: `Total Projects: ${insights.totalProjects}`, break: 1 }),
            new TextRun({ text: `Completed: ${insights.completedProjects}`, break: 1 }),
            new TextRun({ text: `Average Progress: ${Math.round(insights.averageProgress)}%`, break: 1 }),
          ]
        }),
        new Paragraph({
          text: "Projects",
          heading: HeadingLevel.HEADING_1,
        }),
        ...projects.map(project => 
          new Paragraph({
            children: [
              new TextRun({ text: `${project.name}`, bold: true, break: 1 }),
              new TextRun({ text: `Stage: ${project.stage}`, break: 1 }),
              new TextRun({ text: `Progress: ${project.progress}%`, break: 1 }),
              new TextRun({ text: `Priority: ${project.priority}`, break: 1 }),
              new TextRun({ text: `Description: ${project.description || 'No description'}`, break: 1 }),
            ]
          })
        )
      ],
    }],
  });
  
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "bioinformatics-projects-report.docx");
};

// Enhanced Analytics Component
const AdvancedAnalytics = ({ projects, darkMode }) => {
  const insights = generateProjectInsights(projects);
  const suggestions = generateSmartSuggestions(projects);
  
  // Time series data for progress over time (simulated)
  const progressData = eachDayOfInterval({
    start: startOfWeek(new Date()),
    end: endOfWeek(new Date())
  }).map(date => ({
    date: format(date, 'MMM dd'),
    completed: Math.floor(Math.random() * 5),
    inProgress: Math.floor(Math.random() * 8),
    planned: Math.floor(Math.random() * 3)
  }));

  const cardClass = `${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md p-6 border`;
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-300' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* Advanced Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Avg Project Duration</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{insights.timeMetrics.averageProjectDuration} days</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Timer className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Avg Steps/Project</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{insights.timeMetrics.averageStepsPerProject}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Upcoming Deadlines</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{insights.upcomingDeadlines.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${textSecondary} text-sm font-medium`}>Completion Rate</p>
              <p className={`${textPrimary} text-3xl font-bold`}>{Math.round(insights.averageProgress)}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className={cardClass}>
        <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>Project Activity This Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={progressData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" />
            <Area type="monotone" dataKey="inProgress" stackId="1" stroke="#3B82F6" fill="#3B82F6" />
            <Area type="monotone" dataKey="planned" stackId="1" stroke="#F59E0B" fill="#F59E0B" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Smart Suggestions */}
      <div className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Brain className={`h-5 w-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`${textPrimary} text-lg font-semibold`}>Smart Suggestions</h3>
        </div>
        
        <div className="space-y-3">
          {suggestions.length > 0 ? suggestions.map((suggestion, index) => (
            <div key={index} className={`p-3 border-l-4 rounded-lg ${
              suggestion.priority === 'high' 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : suggestion.priority === 'medium'
                ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-medium ${textPrimary}`}>{suggestion.title}</h4>
                  <p className={`text-sm ${textSecondary} mt-1`}>{suggestion.description}</p>
                </div>
                <Lightbulb className={`h-4 w-4 ${
                  suggestion.priority === 'high' ? 'text-red-500' : 
                  suggestion.priority === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
              </div>
            </div>
          )) : (
            <div className={`text-center py-4 ${textSecondary}`}>
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No suggestions at the moment. Great job staying on track!</p>
            </div>
          )}
        </div>
      </div>

      {/* Export Options */}
      <div className={cardClass}>
        <h3 className={`${textPrimary} text-lg font-semibold mb-4`}>Export Reports</h3>
        <div className="flex gap-4">
          <button
            onClick={() => exportToPDF(projects, insights)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download size={16} />
            Export PDF
          </button>
          <button
            onClick={() => exportToWord(projects, insights)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} />
            Export Word
          </button>
        </div>
      </div>
    </div>
  );
};

// About Component
const About = ({ darkMode }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <div className="text-center">
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            Bioinformatics Project Tracker
          </h2>
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            A comprehensive tool for managing and tracking bioinformatics research projects
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://github.com/hms-immunology/bioinformatics-project-tracker"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Project Description */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          About This Project
        </h3>
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} space-y-4`}>
          <p>
            The Bioinformatics Project Tracker is a comprehensive web application specifically designed for 
            bioinformatics researchers to manage, track, and organize their research projects efficiently. 
            Built with React and modern web technologies, this tool provides an intuitive interface for 
            project management with features tailored to computational biology workflows.
          </p>
          <p>
            This application ensures complete data privacy as all project information is stored locally 
            in your browser. No data is sent to external servers, making it perfect for sensitive research 
            projects while maintaining full functionality.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Key Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Project Management
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Drag-and-drop project organization</li>
                <li>Multi-stage workflow tracking</li>
                <li>Priority management system</li>
                <li>Progress tracking with visual indicators</li>
              </ul>
            </div>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Bioinformatics Templates
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Pre-built workflow templates</li>
                <li>RNA-seq, Genome Assembly, Variant Calling</li>
                <li>Metagenomics analysis workflows</li>
                <li>Smart step suggestions</li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Analytics & Tracking
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Built-in time tracking</li>
                <li>Progress visualization</li>
                <li>Performance metrics</li>
                <li>Smart insights and recommendations</li>
              </ul>
            </div>
            <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                Data Export
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>PDF report generation</li>
                <li>Word document export</li>
                <li>Local data persistence</li>
                <li>Complete privacy protection</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Info */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Developer
        </h3>
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className="mb-2">
            <strong className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>Eren Ada, PhD</strong>
          </p>
          <p className="text-sm">
            Department of Immunology, Harvard Medical School
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://github.com/erenada"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
              GitHub Profile
            </a>
            <a
              href="mailto:erenada@gmail.com"
              className={`text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : ''}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
          Version Information
        </h3>
        <div className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} text-sm space-y-2`}>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Last Updated:</strong> June 2, 2025</p>
          <p><strong>License:</strong> MIT License</p>
          <p><strong>Built with:</strong> React 19+, Tailwind CSS, Recharts, DND Kit</p>
        </div>
      </div>
    </div>
  );
};

const BioinformaticsTracker = () => {
  // Initialize projects from localStorage or use default projects
  const [projects, setProjects] = useState(() => {
    const savedProjects = localStorage.getItem('bioinf-projects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
    return [
      {
        id: 1,
        name: "RNA-seq Analysis - Cancer Study",
        stage: "Data Processing",
        progress: 65,
        priority: "High",
        startDate: "2025-05-15",
        dueDate: "2025-07-01",
        description: "Differential expression analysis of tumor vs normal samples",
        completedSteps: [
          { text: "Sample Collection", category: "Lab Work" },
          { text: "Quality Control", category: "Lab Work" },
          { text: "Alignment", category: "Analysis" }
        ],
        nextSteps: [
          { text: "Differential Expression", category: "Analysis" },
          { text: "Pathway Analysis", category: "Analysis" },
          { text: "Visualization", category: "Analysis" }
        ],
        attachments: [],
        tags: ["RNA-seq", "Cancer", "High-throughput"],
        timeTracked: 7200 // 2 hours in seconds
      },
      {
        id: 2,
        name: "Genome Assembly - Plant Species",
        stage: "Assembly",
        progress: 30,
        priority: "Medium",
        startDate: "2025-05-20",
        dueDate: "2025-08-15",
        description: "De novo genome assembly using long-read sequencing",
        completedSteps: [
          { text: "DNA Extraction", category: "Lab Work" },
          { text: "Sequencing", category: "Lab Work" }
        ],
        nextSteps: [
          { text: "Assembly", category: "Analysis" },
          { text: "Annotation", category: "Analysis" },
          { text: "Quality Assessment", category: "Analysis" }
        ],
        attachments: [],
        tags: ["Genome", "Assembly", "Plant", "Long-read"],
        timeTracked: 14400 // 4 hours in seconds
      }
    ];
  });

  // Save projects to localStorage whenever projects state changes
  useEffect(() => {
    localStorage.setItem('bioinf-projects', JSON.stringify(projects));
  }, [projects]);

  // UI State
  const [currentView, setCurrentView] = useState('projects'); // 'projects', 'dashboard', 'analytics', 'about'
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('bioinf-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Enhanced Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterTags, setFilterTags] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    stage: 'Planning',
    progress: 0,
    priority: 'Medium',
    startDate: '',
    dueDate: '',
    description: '',
    completedSteps: [],
    nextSteps: [],
    attachments: [],
    tags: [],
    timeTracked: 0
  });

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('bioinf-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const stages = [
    'Planning', 'Data Collection', 'Quality Control', 'Data Processing', 
    'Analysis', 'Assembly', 'Annotation', 'Visualization', 'Validation', 'Complete'
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Get all available tags
  const availableTags = [...new Set(projects.flatMap(p => p.tags || []))];

  // Enhanced filtering logic
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.completedSteps?.some(step => 
                           (typeof step === 'string' ? step : step.text)?.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         project.nextSteps?.some(step => 
                           (typeof step === 'string' ? step : step.text)?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    const matchesStage = !filterStage || project.stage === filterStage;
    const matchesPriority = !filterPriority || project.priority === filterPriority;
    const matchesTags = filterTags.length === 0 || 
                       filterTags.some(tag => project.tags?.includes(tag.value));
    
    return matchesSearch && matchesStage && matchesPriority && matchesTags;
  });

  // Handle time tracking updates
  const handleTimeUpdate = (projectId, timeTracked) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, timeTracked } : p
    ));
  };

  // Handle drag end event for project cards
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Handle drag end for steps within form
  const handleStepDragEnd = (result, stepType) => {
    if (!result.destination) return;

    const items = Array.from(formData[stepType]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData({ ...formData, [stepType]: items });
  };

  // Template selection handler
  const handleTemplateSelect = (template) => {
    const completedSteps = template.steps.slice(0, Math.floor(template.steps.length / 3));
    const nextSteps = template.steps.slice(Math.floor(template.steps.length / 3));
    
    setFormData(prev => ({
      ...prev,
      completedSteps: [...prev.completedSteps, ...completedSteps],
      nextSteps: [...prev.nextSteps, ...nextSteps]
    }));
  };

  // Step management handlers
  const handleStepUpdate = (index, updatedStep, stepType) => {
    const steps = [...formData[stepType]];
    steps[index] = updatedStep;
    setFormData({ ...formData, [stepType]: steps });
  };

  const handleAddStep = (stepType) => {
    setFormData({ 
      ...formData, 
      [stepType]: [...formData[stepType], { text: '', category: 'Other' }] 
    });
  };

  const handleRemoveStep = (index, stepType) => {
    const steps = formData[stepType].filter((_, i) => i !== index);
    setFormData({ ...formData, [stepType]: steps });
  };

  // File attachment handlers
  const handleAddAttachment = (attachment) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }));
  };

  const handleRemoveAttachment = (attachmentId) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attachmentId)
    }));
  };

  const handleSubmit = () => {
    if (editingProject) {
      setProjects(projects.map(p => 
        p.id === editingProject.id 
          ? { ...formData, id: editingProject.id }
          : p
      ));
      setEditingProject(null);
    } else {
      const newProject = {
        ...formData,
        id: Date.now(),
        completedSteps: formData.completedSteps.filter(step => step.text && step.text.trim()),
        nextSteps: formData.nextSteps.filter(step => step.text && step.text.trim())
      };
      setProjects([...projects, newProject]);
    }
    
    setFormData({
      name: '', stage: 'Planning', progress: 0, priority: 'Medium',
      startDate: '', dueDate: '', description: '', completedSteps: [], nextSteps: [], attachments: [],
      tags: [], timeTracked: 0
    });
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    // Ensure backward compatibility for projects without categories
    const normalizeSteps = (steps) => {
      return steps.map(step => {
        if (typeof step === 'string') {
          return { text: step, category: 'Other' };
        }
        return step;
      });
    };

    setFormData({
      ...project,
      completedSteps: normalizeSteps(project.completedSteps || []),
      nextSteps: normalizeSteps(project.nextSteps || []),
      attachments: project.attachments || [],
      tags: project.tags || [],
      timeTracked: project.timeTracked || 0
    });
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Bioinformatics Project Tracker
            </h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
              Manage your research projects, track progress, and meet deadlines
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className={`flex rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} p-1 shadow-md`}>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('analytics')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'analytics'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Activity size={16} />
                Analytics
              </button>
              <button
                onClick={() => setCurrentView('projects')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'projects'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3X3 size={16} />
                Projects
              </button>
              <button
                onClick={() => setCurrentView('about')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'about'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : darkMode
                    ? 'text-gray-300 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              } shadow-md`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* New Project Button */}
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
            >
              <Plus size={20} />
              New Project
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <Dashboard projects={projects} darkMode={darkMode} />
        )}

        {/* Advanced Analytics View */}
        {currentView === 'analytics' && (
          <AdvancedAnalytics projects={projects} darkMode={darkMode} />
        )}

        {/* Projects View */}
        {currentView === 'projects' && (
          <>
            {/* Enhanced Search and Filters */}
            <AdvancedSearchFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStage={filterStage}
              setFilterStage={setFilterStage}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterTags={filterTags}
              setFilterTags={setFilterTags}
              availableTags={availableTags}
              stages={stages}
              priorities={priorities}
              darkMode={darkMode}
            />

            {/* Project Grid with Drag and Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={filteredProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {filteredProjects.map(project => (
                    <div key={project.id} className="space-y-3">
                      <SortableProjectCard
                        project={project}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        darkMode={darkMode}
                      />
                      <TimeTracker
                        project={project}
                        onTimeUpdate={(timeTracked) => handleTimeUpdate(project.id, timeTracked)}
                        darkMode={darkMode}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {/* No Results Message */}
            {filteredProjects.length === 0 && (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Target size={48} className="mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No projects found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </>
        )}

        {/* About View */}
        {currentView === 'about' && (
          <About darkMode={darkMode} />
        )}

        {/* Enhanced Project Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl`}>
              <div className="p-6">
                <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Basic Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Basic Project Information */}
                    <div className="space-y-4">
                      <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Project Information
                      </h3>
                      
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Project Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Enter project name"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Current Stage
                          </label>
                          <select
                            value={formData.stage}
                            onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {stages.map(stage => (
                              <option key={stage} value={stage}>{stage}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Priority
                          </label>
                          <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          >
                            {priorities.map(priority => (
                              <option key={priority} value={priority}>{priority}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Progress (%)
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className={`text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {formData.progress}%
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Description
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder="Enter project description"
                        />
                      </div>

                      {/* Project Tags */}
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Project Tags
                        </label>
                        <CreatableSelect
                          isMulti
                          options={availableTags.map(tag => ({ value: tag, label: tag }))}
                          value={formData.tags.map(tag => ({ value: tag, label: tag }))}
                          onChange={(selectedTags) => {
                            setFormData({ 
                              ...formData, 
                              tags: selectedTags ? selectedTags.map(tag => tag.value) : [] 
                            });
                          }}
                          placeholder="Add tags (press Enter to create new tags)..."
                          styles={{
                            control: (provided) => ({
                              ...provided,
                              backgroundColor: darkMode ? '#374151' : '#ffffff',
                              borderColor: darkMode ? '#4B5563' : '#D1D5DB',
                              color: darkMode ? '#ffffff' : '#111827',
                              minHeight: '38px'
                            }),
                            menu: (provided) => ({
                              ...provided,
                              backgroundColor: darkMode ? '#374151' : '#ffffff',
                              border: darkMode ? '1px solid #4B5563' : '1px solid #D1D5DB'
                            }),
                            option: (provided, state) => ({
                              ...provided,
                              backgroundColor: state.isFocused 
                                ? (darkMode ? '#4B5563' : '#F3F4F6')
                                : (darkMode ? '#374151' : '#ffffff'),
                              color: darkMode ? '#ffffff' : '#111827'
                            }),
                            multiValue: (provided) => ({
                              ...provided,
                              backgroundColor: darkMode ? '#4B5563' : '#E5E7EB'
                            }),
                            multiValueLabel: (provided) => ({
                              ...provided,
                              color: darkMode ? '#ffffff' : '#111827'
                            }),
                            multiValueRemove: (provided) => ({
                              ...provided,
                              color: darkMode ? '#ffffff' : '#111827',
                              ':hover': {
                                backgroundColor: darkMode ? '#EF4444' : '#FEE2E2',
                                color: darkMode ? '#ffffff' : '#DC2626'
                              }
                            })
                          }}
                        />
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          Add relevant tags like "RNA-seq", "Cancer", "High-throughput", etc.
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Steps Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          Project Steps
                        </h3>
                        <TemplateSelector onSelectTemplate={handleTemplateSelect} darkMode={darkMode} />
                      </div>

                      {/* Completed Steps */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Completed Steps
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddStep('completedSteps')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            + Add Step
                          </button>
                        </div>
                        
                        <DragDropContext onDragEnd={(result) => handleStepDragEnd(result, 'completedSteps')}>
                          <Droppable droppableId="completedSteps">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {formData.completedSteps.map((step, index) => (
                                  <DraggableStep
                                    key={`completed-${index}`}
                                    step={step}
                                    index={index}
                                    onUpdate={(i, updatedStep) => handleStepUpdate(i, updatedStep, 'completedSteps')}
                                    onRemove={(i) => handleRemoveStep(i, 'completedSteps')}
                                    darkMode={darkMode}
                                    suggestions={COMMON_STEPS}
                                  />
                                ))}
                                {provided.placeholder}
                                {formData.completedSteps.length === 0 && (
                                  <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No completed steps yet. Click "Add Step" to get started.
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>

                      {/* Next Steps */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Next Steps
                          </label>
                          <button
                            type="button"
                            onClick={() => handleAddStep('nextSteps')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            + Add Step
                          </button>
                        </div>
                        
                        <DragDropContext onDragEnd={(result) => handleStepDragEnd(result, 'nextSteps')}>
                          <Droppable droppableId="nextSteps">
                            {(provided) => (
                              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                {formData.nextSteps.map((step, index) => (
                                  <DraggableStep
                                    key={`next-${index}`}
                                    step={step}
                                    index={index}
                                    onUpdate={(i, updatedStep) => handleStepUpdate(i, updatedStep, 'nextSteps')}
                                    onRemove={(i) => handleRemoveStep(i, 'nextSteps')}
                                    darkMode={darkMode}
                                    suggestions={COMMON_STEPS}
                                  />
                                ))}
                                {provided.placeholder}
                                {formData.nextSteps.length === 0 && (
                                  <div className={`text-center py-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    No next steps planned. Click "Add Step" to plan ahead.
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </div>

                      {/* File Attachments */}
                      <FileAttachments
                        attachments={formData.attachments}
                        onAdd={handleAddAttachment}
                        onRemove={handleRemoveAttachment}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>

                  {/* Right Column - Timeline & Preview */}
                  <div className="space-y-6">
                    <ProjectTimeline project={formData} darkMode={darkMode} />
                    
                    {/* Project Summary */}
                    <div className={`p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                      <h4 className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        Project Summary
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Completed Steps:</span>
                          <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{formData.completedSteps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Next Steps:</span>
                          <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{formData.nextSteps.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Attachments:</span>
                          <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{formData.attachments.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress:</span>
                          <span className={darkMode ? 'text-gray-200' : 'text-gray-800'}>{formData.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProject(null);
                      setFormData({
                        name: '', stage: 'Planning', progress: 0, priority: 'Medium',
                        startDate: '', dueDate: '', description: '', completedSteps: [], nextSteps: [], attachments: [],
                        tags: [], timeTracked: 0
                      });
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingProject ? 'Update Project' : 'Add Project'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BioinformaticsTracker;
