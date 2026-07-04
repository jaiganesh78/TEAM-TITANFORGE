# Security Policy

We take the security of our AI Executive Operating System and customer proprietary data extremely seriously. As an enterprise-grade platform handling sensitive financial, marketing, and strategic business data, security is integrated into every layer of our systems.

---

## 🛡️ Supported Versions

Only the active development versions receive security updates:

| Version | Supported |
| :--- | :--- |
| v0.1.x | Yes (Active Development) |
| < v0.1.0 | No |

---

## 🔒 Reporting a Vulnerability

**Please do not open a public GitHub issue for security bugs.**

If you discover a vulnerability, report it securely to our Security Engineering Team:

1. **Email**: Send detailed logs, reproduction steps, and potential impacts to `security@businessgrowthos.ai`.
2. **PGP Encryption**: Encrypt your message using our public PGP key (available in keys directory/registry).
3. **Response Timeline**: We acknowledge receipts within **24 hours** and provide periodic progress updates until a patch is deployed.

---

## 🔑 Data Isolation Policies

- **Multi-Tenant Protection**: All user database schemas and ChromaDB vector namespaces are partitioned with tenant workspace IDs.
- **Credential Handing**: API keys for external services (e.g. Google Gemini, PostgreSQL, Vercel) are injected via protected environment vaults and rotated periodically.
- **LLM Privacy**: Data sent to third-party LLM providers utilizes zero-data-retention APIs to prevent client business data from polluting public model training sets.
