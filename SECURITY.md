# Security Advisory

## Known Vulnerabilities

### xlsx package (high severity)
- **Issue:** Prototype Pollution and ReDoS vulnerabilities in xlsx library
- **Status:** No fix currently available from maintainer
- **Mitigation:** 
  - File size limits are enforced (10MB max)
  - Rate limiting is active on upload endpoint (10 uploads per 15 minutes)
  - File type validation is in place
  - Only trusted users should have access to upload functionality
  - Consider adding user authentication if deploying publicly

### Recommendations
1. Monitor the xlsx package for security updates
2. Implement user authentication for the upload endpoint
3. Consider alternative libraries if security is critical
4. Run `npm audit` regularly to check for new vulnerabilities

Last checked: November 2025
