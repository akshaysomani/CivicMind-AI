# Security Policy

We take the security of CivicMind AI seriously. If you believe you have found a security vulnerability, please follow the guidelines below to report it.

## Reporting a Vulnerability
Please do not report security vulnerabilities through public GitHub issues. Instead, email a detailed report to the security contact email at `security@civicmind.demo`. 

Include in your report:
- A description of the vulnerability.
- Steps to reproduce or a Proof of Concept (PoC).
- Potential impact.

We will acknowledge receipt within 48 hours and work with you to coordinate a disclosure timeline.

## Implemented Security Safeguards
CivicMind AI employs several layers of security:
- **JWT Authentication:** Strict authorization flow utilizing JSON Web Tokens with password hashing via `passlib[bcrypt]`.
- **Role-Based Access Control (RBAC):** Route guards on the frontend and authorization middleware on the backend to enforce Citizen, NGO, Government, and Admin roles.
- **AI Safety & PII Guardrails:** Semantic routing checks, toxicity filters, and automated PII anonymization built directly into the AI Orchestrator stack.
- **Rate Limiting:** IP-based requests throttling to prevent brute-force attacks and abuse.
