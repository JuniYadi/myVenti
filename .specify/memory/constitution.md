<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (initial constitution)
Modified principles: N/A (new constitution)
Added sections: Core Principles (4), Performance Standards, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md (Constitution Check section updated)
  ✅ spec-template.md (already aligned with independent testing approach)
  ⚠ tasks-template.md (needs lightweight testing emphasis)
  ✅ command templates (no agent-specific references found)
Follow-up TODOs: N/A
-->

# MyVenti Constitution

## Core Principles

### I. Code Quality & Simplicity
Code MUST be simple, readable, and maintainable. Prefer straightforward solutions over complex architectures. Each component should have a single, clear responsibility. Heavy abstractions and over-engineering are explicitly prohibited unless absolutely necessary for cross-platform compatibility.

### II. Performance-First Development
Performance is a feature, not an afterthought. All code MUST be written with performance in mind from the start. This includes efficient state management, optimized renders, minimal bundle size, and smooth 60fps animations. Performance budgets MUST be established and monitored for every feature.

### III. User Experience Consistency
UI/UX MUST be consistent across all platforms and screens. Follow established design patterns and maintain visual hierarchy. All user interactions should feel responsive and intuitive. Platform-specific conventions MUST be respected where appropriate (iOS vs Android patterns).

### IV. Lightweight Testing Approach
Focus on essential testing that provides maximum value with minimal overhead. Prefer simple integration tests and manual verification over complex unit test suites. Tests should be easy to write, maintain, and understand. The goal is confidence in core functionality, not comprehensive test coverage.

## Performance Standards

### Mobile Performance Requirements
- **Startup Time**: App MUST load within 3 seconds on mid-range devices
- **Animation Performance**: All animations MUST maintain 60fps (16ms per frame)
- **Memory Usage**: Target <100MB memory usage during normal operation
- **Bundle Size**: JavaScript bundle MUST stay under 2MB initially, <5MB with features
- **Network Efficiency**: API calls should be minimized and properly cached
- **Battery Impact**: Avoid excessive background processing and unnecessary re-renders

### Code Performance Guidelines
- Use React.memo and useMemo judiciously to prevent unnecessary re-renders
- Implement proper image optimization and lazy loading
- Minimize state updates and batch them where possible
- Use FlatList instead of Map for long lists
- Profile and optimize navigation transitions

## Development Workflow

### Feature Development Process
1. **Research**: Always use MCP Context7 for latest documentation first, Web Search as backup
2. **Simple Prototyping**: Create minimal working version before adding complexity
3. **Performance Validation**: Test on real devices, not just simulators
4. **Cross-Platform Verification**: Ensure functionality works on both iOS and Android
5. **UX Review**: Validate user experience matches platform conventions

### Code Review Requirements
- All changes MUST be reviewed for performance impact
- Code MUST be simple enough for team members to understand quickly
- UI components MUST be tested on both platforms
- Complex implementations MUST be justified with simpler alternatives considered

### Documentation Standards
- README files MUST be kept up-to-date with setup instructions
- Complex business logic SHOULD have inline comments explaining the "why"
- Performance considerations MUST be documented for critical paths

## Governance

This constitution supersedes all other development practices and guidelines. Amendments to this constitution require:

1. **Proposal**: Written proposal describing the change and its rationale
2. **Review**: Team review with consideration of impact on existing code
3. **Approval**: Majority approval from core development team
4. **Documentation**: Update this document and communicate changes to all team members

### Compliance Requirements
- All pull requests MUST verify compliance with these principles
- Code reviewers are responsible for enforcing constitution compliance
- Performance violations MUST be justified with measurable reasons
- Complex implementations MUST be approved by at least two team members

### Versioning Policy
- **MAJOR**: Backward incompatible changes to principles or removal of core requirements
- **MINOR**: New principles or substantial additions to existing sections
- **PATCH**: Clarifications, wording improvements, non-semantic refinements

**Version**: 1.0.0 | **Ratified**: 2025-10-22 | **Last Amended**: 2025-10-22