# File Cleanup Task List

## High Priority Tasks

### 1. Remove Build Artifacts
- [ ] Delete `dist/` directory (compiled JavaScript files)
- [ ] Delete `generated/` directory (Prisma generated files)

### 2. Remove Test Results & Reports
- [ ] Delete `test-results/` directory
- [ ] Delete `playwright-report/` directory
- [ ] Delete `coverage/` directory (if exists)

### 3. Remove Outdated Configuration
- [ ] Delete `.eslintrc.json` (redundant with `eslint.config.mjs`)

## Medium Priority Tasks

### 4. Remove Archive & Temporary Files
- [ ] Delete `archives/TODO-Wed-Aug-6th.md`
- [ ] Delete `.claude/settings.local.json`
- [ ] Delete `.DS_Store` files (macOS system files)

### 5. Remove Redundant Test Files
- [ ] Delete `__tests__/` directory (legacy test structure)

### 6. Remove Log Files
- [ ] Delete `*.log` files
- [ ] Delete `npm-debug.log*` files
- [ ] Delete `yarn-debug.log*` files
- [ ] Delete `yarn-error.log*` files

## Low Priority Tasks

### 7. Update Package.json Scripts
- [ ] Add `clean:all` script
- [ ] Add `clean:config` script
- [ ] Add `clean:docs` script
- [ ] Add `clean:logs` script
- [ ] Add `clean:system` script

### 8. Update .gitignore
- [ ] Add `.claude/` directory to .gitignore

## Post-Cleanup Verification

### 9. Test Functionality
- [ ] Verify all tests still pass
- [ ] Ensure build process works without `dist/` directory
- [ ] Test Prisma client generation
- [ ] Verify application can start properly

### 10. Documentation Update
- [ ] Update any documentation that references deleted files
- [ ] Consider adding cleanup scripts to CI/CD pipeline

## Git Workflow & TDD Protocol

### 11. Git Workflow Compliance
- [ ] Pull latest code from `main` branch before starting
- [ ] Create feature branch: `git checkout -b cleanup/file-cleanup-YYYY-MM-DD`
- [ ] Commit changes with descriptive messages following TDD cycle
- [ ] Push branch to remote repository
- [ ] Create PR from feature branch to `main` branch
- [ ] Assign PR to configured GitHub user
- [ ] Wait for PR review and approval before merging

### 12. TDD Protocol Compliance
- [ ] **RED Phase**: Write failing test for any new functionality needed
- [ ] **GREEN Phase**: Implement minimal code to make test pass
- [ ] **REFACTOR Phase**: Clean up code while maintaining test coverage
- [ ] Run full test suite after each phase
- [ ] Ensure no existing tests break during cleanup
- [ ] Maintain test coverage at current levels or higher

### 13. Testing Strategy
- [ ] **Unit Tests**: Verify individual file deletion functions work correctly
- [ ] **Integration Tests**: Ensure build process works after cleanup
- [ ] **E2E Tests**: Verify application functionality remains intact
- [ ] **Regression Tests**: Confirm no breaking changes introduced

## Files to Keep (DO NOT DELETE)

- `Dockerfile.e2e` - Required for e2e testing
- `src/components/structure.spec.ts` - Important structure validation
- `.env*` files - Environment configuration
- `CLAUDE.md` - Project documentation

## Quick Cleanup Commands

```bash
# One-liner for most files
rm -rf dist/ generated/ test-results/ playwright-report/ coverage/ archives/ .claude/ __tests__ && \
rm -f .eslintrc.json *.log npm-debug.log* yarn-debug.log* yarn-error.log* && \
find . -name ".DS_Store" -delete
```

## Git Commands for Workflow

```bash
# Before starting cleanup
git pull origin main
git checkout -b cleanup/file-cleanup-$(date +%Y-%m-%d)

# After cleanup (commit and push)
git add .
git commit -m "feat: implement comprehensive file cleanup following TDD protocol"
git push origin cleanup/file-cleanup-$(date +%Y-%m-%d)

# Create PR (requires GitHub CLI)
gh pr create --title "File Cleanup: Remove outdated and generated files" --body "Implements comprehensive file cleanup following project TDD protocol and git workflow standards."
```

## Estimated Time: 15-30 minutes (cleanup) + 15-20 minutes (testing & git workflow)
## Risk Level: Low (all files are either generated, outdated, or redundant)
## Compliance: Follows project Git workflow and TDD protocol standards
