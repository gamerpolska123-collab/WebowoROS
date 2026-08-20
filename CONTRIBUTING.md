# Contributing to WebowoROS

## Development Workflow

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** following our coding standards
4. **Run tests**: `npm run test`
5. **Run lint**: `npm run lint`
6. **Commit**: `git commit -m "feat: your feature"`
7. **Push**: `git push origin feature/your-feature`
8. **Create a Pull Request**

## Coding Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Flat config with @typescript-eslint/recommended
- **Prettier**: 100 char width, single quotes, trailing commas
- **Testing**: Jest + React Testing Library (frontend), Jest (backend)
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`)

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Pull Request Template

```markdown
## What changed?
Brief description of changes.

## Why?
Reason for the change.

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing done

## Screenshots (if UI changed)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

## Questions?

Open an issue or contact the team.
