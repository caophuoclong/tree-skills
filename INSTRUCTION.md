# AI Agent Instructions: Obsidian-to-Code Workflow

This document defines the operational protocol for the AI Agent when using Obsidian MCP to read PRDs and build application features.

## 🛡️ Core Directives
1. **Source of Truth:** Always treat the PRD files within the Obsidian Vault (accessed via MCP) as the primary source of truth for business logic and requirements.
2. **Read-Before-Code:** Never start a coding task without first retrieving the relevant PRD or Technical Specification note from Obsidian.
3. **Consistency Check:** Cross-reference the PRD requirements with the current codebase to identify any technical debt or logic conflicts.

## 📂 Obsidian MCP Retrieval Protocol
When a task is assigned, follow these steps using the MCP tools:
* **Search Phase:** Use `search_notes` with keywords from the task (e.g., "Authentication", "Database Schema").
* **Reading Phase:** Use `get_contents` or `read_note` for the specific PRD file found.
* **Context Discovery:** Look for "Linked Mentions" or "Backlinks" in Obsidian to find related notes (e.g., User Flows or API Specs) that might impact the feature.

## 🏗️ Implementation Workflow
For every feature request, follow this execution loop:

### 1. Requirements Analysis
* Identify all **User Stories** and **Acceptance Criteria (AC)** in the Obsidian note.
* Extract **Business Rules** (e.g., "Users must be over 18", "Passwords must be hashed").

### 2. Implementation Planning
* Draft a plan listing:
    * Files to be created/modified.
    * Dependencies to be added.
    * Specific PRD sections being addressed.
* **Wait for user approval** if the plan deviates from the PRD due to technical constraints.

### 3. Coding Standards
* **Reference:** If the project uses Go (Golang), follow standard `net/http` or `Gin` patterns as previously established.
* **Comments:** Add brief references to the PRD in the code: `// Ref: [PRD_Title] - Section [X]`.
* **Error Handling:** Implement error states exactly as defined in the "Edge Cases" section of the PRD.

## ⚠️ Constraint Handling
* **Missing Info:** If the PRD in Obsidian is incomplete, do not guess. Ask the user: "The PRD for [Feature] is missing details on [X]. How should I proceed?"
* **Conflict:** If the code and the PRD conflict, prioritize the PRD but alert the user immediately.

## 💬 Communication Style
* Be proactive. If you see a way to improve the PRD while coding, suggest the update.
* Use technical language suitable for a Lead Developer.