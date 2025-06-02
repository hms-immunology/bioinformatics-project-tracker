# Contributing to Bioinformatics Project Tracker

Thank you for your interest in contributing to the Bioinformatics Project Tracker! This document provides guidelines and information for contributors.

## Ways to Contribute

### Bug Reports
- Use the [issue tracker](https://github.com/yourusername/bioinf-tracker/issues) to report bugs
- Before creating a new issue, search existing issues to avoid duplicates
- Include detailed information about the bug and steps to reproduce

### Feature Requests
- Submit feature requests through the issue tracker
- Clearly describe the feature and its potential benefits
- Consider if the feature aligns with the project's bioinformatics focus

### Code Contributions
- Fork the repository and create a feature branch
- Follow the development guidelines below
- Submit a pull request with a clear description of changes

### Documentation
- Help improve documentation, examples, and tutorials
- Fix typos, clarify instructions, or add missing information

## Development Setup

### Prerequisites
- Node.js 14.0 or higher
- npm or yarn package manager
- Git for version control

### Local Development
1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/bioinf-tracker.git
   cd bioinf-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Development Guidelines

### Code Style
- Follow React best practices and hooks patterns
- Use functional components with hooks over class components
- Maintain consistent indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Component Structure
```javascript
/**
 * Brief description of component purpose
 * @param {Object} props - Component props
 * @param {string} props.example - Example prop description
 */
const MyComponent = ({ example }) => {
  // Hook declarations
  const [state, setState] = useState(initialValue);
  
  // Effect hooks
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-styles">
      {/* Component JSX */}
    </div>
  );
};
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the existing dark/light mode pattern
- Ensure responsive design (mobile-first approach)
- Use consistent spacing and typography scales

### State Management
- Use React hooks for local state
- Keep state as close to where it's needed as possible
- Use localStorage for data persistence
- Consider performance implications of state updates

## Testing

### Writing Tests
- Write unit tests for utility functions
- Add integration tests for key user flows
- Test both light and dark mode variations
- Ensure responsive behavior across screen sizes

### Test Structure
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  test('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('should handle user interactions', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    // Assert expected behavior
  });
});
```

## Pull Request Process

### Before Submitting
1. **Update documentation** if you've changed functionality
2. **Add tests** for new features or bug fixes
3. **Run the test suite** and ensure all tests pass
4. **Check responsive design** on different screen sizes
5. **Test dark/light mode** compatibility

### Pull Request Template
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Tested responsive design
- [ ] Tested dark/light mode

## Screenshots (if applicable)
Add screenshots showing the changes

## Additional Notes
Any additional information or context
```

### Review Process
1. **Automated checks** must pass (linting, tests)
2. **Code review** by maintainer(s)
3. **Testing** on different browsers and devices
4. **Merge** after approval

## Design Guidelines

### User Interface
- Prioritize usability for researchers
- Maintain consistency with existing design patterns
- Consider accessibility (WCAG guidelines)
- Use clear, descriptive labels and instructions

### Bioinformatics Context
- Understand common bioinformatics workflows
- Use appropriate terminology and conventions
- Consider the needs of computational biologists
- Test with real-world use cases when possible

## Adding New Features

### Bioinformatics Templates
To add new workflow templates:

1. **Research the workflow** - Understand the typical steps
2. **Define categories** - Classify steps appropriately
3. **Add to templates** - Update `BIOINFORMATICS_TEMPLATES`
4. **Test thoroughly** - Ensure steps make sense in context

### New Components
1. **Plan the component** - Define props and behavior
2. **Follow patterns** - Use existing components as reference
3. **Add to appropriate location** - Organize files logically
4. **Document usage** - Add clear prop documentation

## Reporting Issues

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. Scroll down to...
4. See error

## Expected Behavior
What you expected to happen

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96.0]
- Version: [e.g. 1.0.0]

## Additional Context
Any other context about the problem
```

## Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How would you like it to work?

## Alternatives Considered
Any alternative solutions you've considered

## Additional Context
Screenshots, mockups, or examples
```

## Commit Message Guidelines

Use clear, descriptive commit messages:

### Format
```
type(scope): brief description

Detailed explanation if needed

Closes #issue-number
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(analytics): add time tracking analytics dashboard

fix(drag-drop): resolve project reordering issue on mobile

docs(readme): update installation instructions

style(components): improve responsive design for project cards
```

## Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes for significant contributions
- Special recognition for first-time contributors

## Getting Help

- **Questions about contributing**: Open a discussion or issue
- **Technical help**: Review existing issues or create a new one
- **General feedback**: Use the discussions section

## Code of Conduct

### Our Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy toward other community members

### Enforcement
Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

Thank you for contributing to the Bioinformatics Project Tracker! Your efforts help make computational biology research more organized and efficient. 