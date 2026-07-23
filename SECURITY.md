# Security Policy

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, report them privately via one of:

- GitHub's [private vulnerability reporting](https://github.com/MAKaminski/OurAI/security/advisories/new)
- Our [contact form](https://ourai.dev/contact)

Please include:

- A description of the vulnerability and its impact
- Steps to reproduce (proof of concept if possible)
- Affected version / commit

We aim to acknowledge reports within **3 business days** and to provide a
remediation timeline after triage.

## Scope

OurAI runs AI agents with tool access (filesystem, git, shell) against a repo in
an isolated worktree, and the orchestrator holds model and GitHub credentials.
Reports concerning sandbox escape, credential exposure, RLS bypass, or
injection into the agent loop are especially valued.

## Supported Versions

OurAI is pre-1.0; only the latest `main` is supported for security fixes during
this phase.
