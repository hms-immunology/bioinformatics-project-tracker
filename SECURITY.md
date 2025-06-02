# Security Policy

## Supported Versions

We release security updates for the following versions of the Bioinformatics Project Tracker:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Model

The Bioinformatics Project Tracker follows a client-side security model with the following characteristics:

### Data Storage
- **Local Storage Only**: All project data is stored locally in the user's browser using localStorage
- **No Server Communication**: The application does not transmit data to external servers
- **Client-Side Processing**: All data processing occurs within the user's browser
- **No User Authentication**: Single-user application without authentication requirements

### Data Protection
- **Browser Isolation**: Data is isolated to the specific browser and domain
- **HTTPS Recommended**: Use HTTPS when hosting to protect against network-based attacks
- **No Data Transmission**: Sensitive research data never leaves the user's device
- **Local Encryption**: Browser storage is encrypted by the browser's security mechanisms

## Potential Security Considerations

### Browser Security Dependencies
- **Browser Updates**: Keep your browser updated for latest security patches
- **JavaScript Security**: Requires JavaScript to be enabled (inherent security consideration)
- **Cross-Site Scripting (XSS)**: Modern browsers provide built-in XSS protection
- **Local Storage Limits**: Data persistence depends on browser storage policies

### File Attachment Security
- **Client-Side Only**: Uploaded files are processed entirely in the browser
- **No File Execution**: Files are stored as metadata only (name, size, type)
- **Memory Limitations**: Large files may impact browser performance
- **File Type Validation**: Basic file type checking based on extensions

### Export Security
- **PDF Generation**: Uses jsPDF library for client-side PDF creation
- **Word Document Export**: Uses docx library for client-side document generation
- **Data Integrity**: Exported data reflects current browser state
- **File Download Security**: Follows browser's download security policies

## Reporting Security Vulnerabilities

If you discover a security vulnerability in the Bioinformatics Project Tracker, please report it responsibly:

### How to Report
1. **Email**: Send details to the project maintainer (replace with actual email)
2. **GitHub Issues**: For non-sensitive issues, use the GitHub issue tracker
3. **Private Disclosure**: For sensitive vulnerabilities, use private communication

### What to Include
- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact Assessment**: Potential impact and affected components
- **Browser Information**: Browser type, version, and operating system
- **Screenshots**: Visual evidence if applicable

### Response Timeline
- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 5 business days
- **Resolution Target**: Security patches within 30 days for critical issues
- **Public Disclosure**: After fix is available and tested

## Security Best Practices for Users

### Browser Security
- **Keep Updated**: Use the latest version of supported browsers
- **Security Extensions**: Consider using reputable security extensions
- **Private Browsing**: Use private/incognito mode for sensitive research data
- **Regular Cleanup**: Clear browser data periodically

### Data Protection
- **Regular Backups**: Export project data regularly for backup purposes
- **Sensitive Data**: Consider the sensitivity of research data before input
- **Shared Computers**: Always clear browser data on shared or public computers
- **Local Access**: Ensure your computer is secure from unauthorized local access

### Network Security
- **HTTPS Only**: Access the application only via HTTPS connections
- **Secure Networks**: Avoid using on unsecured public WiFi networks
- **VPN Usage**: Consider VPN for additional network security
- **Firewall Protection**: Maintain active firewall protection

## Development Security

### Code Security
- **Dependency Management**: Regular updates of npm dependencies
- **Security Audits**: Automated security scanning of dependencies
- **Code Review**: Security considerations in code review process
- **Static Analysis**: Use of security-focused linting and analysis tools

### Build Security
- **Secure Build Process**: CI/CD pipeline security measures
- **Integrity Verification**: Build artifact integrity verification
- **Access Control**: Limited access to build and deployment systems
- **Audit Logging**: Comprehensive logging of build and deployment activities

### Third-Party Dependencies
We monitor security advisories for all dependencies:

#### Major Dependencies
- **React**: Core framework security updates
- **Tailwind CSS**: CSS framework security considerations
- **Recharts**: Chart library security monitoring
- **DND Kit**: Drag-and-drop library security reviews
- **jsPDF**: PDF generation library security updates
- **docx**: Word document library security monitoring

#### Security Monitoring
- **Automated Scanning**: Regular automated dependency vulnerability scanning
- **Update Policy**: Prompt updates for security-related dependency updates
- **Risk Assessment**: Evaluation of security impact for each dependency
- **Alternative Evaluation**: Assessment of alternative libraries when security issues arise

## Compliance and Standards

### Web Security Standards
- **Content Security Policy (CSP)**: Implementation recommendations for hosting
- **Secure Headers**: HTTP security header recommendations
- **OWASP Guidelines**: Following OWASP web application security guidelines
- **Browser Security**: Compliance with modern browser security standards

### Data Protection
- **GDPR Considerations**: Local-only storage helps with data protection compliance
- **Data Minimization**: Only collect necessary project information
- **User Control**: Complete user control over their data
- **Data Portability**: Easy data export capabilities

## Incident Response

### Security Incident Classification
- **Critical**: Immediate data exposure or system compromise
- **High**: Potential for data exposure or significant impact
- **Medium**: Limited impact or theoretical vulnerabilities
- **Low**: Minor security improvements or informational issues

### Response Procedures
1. **Detection**: Identification of security issue
2. **Assessment**: Impact and severity evaluation
3. **Containment**: Immediate steps to limit exposure
4. **Investigation**: Root cause analysis
5. **Resolution**: Development and testing of fix
6. **Communication**: User notification and guidance
7. **Follow-up**: Monitoring and prevention improvements

## Security Contact Information

For security-related inquiries:

- **Primary Contact**: Eren Ada, PhD
- **Email**: [Replace with actual email]
- **Response Time**: 48 hours for acknowledgment
- **Escalation**: GitHub issues for public, non-sensitive reports

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who help improve the security of the Bioinformatics Project Tracker:

- **Recognition**: Security researchers will be credited in release notes
- **Responsible Disclosure**: We commit to working with researchers on disclosure timelines
- **No Bug Bounty**: This is an open-source project without formal bug bounty program
- **Community Appreciation**: Public thanks for meaningful security contributions

---

**Last Updated**: June 2, 2025  
**Next Review**: December 2, 2025

This security policy will be reviewed and updated regularly to address evolving security considerations and best practices. 