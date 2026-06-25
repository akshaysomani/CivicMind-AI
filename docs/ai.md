# Multi-Agent AI Architecture & Prompt Rules

This document details the multi-agent routing architecture, Gemini LLM integrations, and security guardrail parameters.

---

## 1. Multi-Agent Routing Flow

The routing engine uses **Gemini 1.5 Pro** to classify citizen prompts semantically, routing queries to specialized subprocessors:

1. **GIS Specialist Agent:** Processes spatial queries, coordinate queries, and ward boundaries mapping rules.
2. **Healthcare Intelligence Agent:** Processes demographic insights, local wellness clinic lookups, and contagious ward concerns.
3. **Schemes Eligibility Agent:** Matches individual user profiles with active municipal grants or state welfare programs.
4. **General Assistant Agent:** Resolves basic municipal bylaws questions or user profile concerns.

---

## 2. Injected Prompt Rules & Safety Guardrails

All prompt executions pass through safety middlewares before returning responses to the user:

- **Toxicity Filtering:** Semantic evaluation checks to block swear words, harassment, or verbal abuse in citizen reports.
- **PII Anonymization:** Regex and NER models screen input parameters and redact Social Security numbers, telephone numbers, and email addresses.
- **System Prompt Guardrails:** Explicit instructions injected in Gemini models to restrict agent outputs to municipal contexts, preventing prompt injections or jailbreaks.
