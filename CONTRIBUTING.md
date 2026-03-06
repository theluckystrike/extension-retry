# CONTRIBUTING

Thank you for your interest in contributing to extension-retry.

## REPORTING ISSUES

When reporting issues, please include:

- A clear description of the problem
- Steps to reproduce the issue
- The expected behavior versus actual behavior
- Your environment details (Node version, browser, OS)
- Any relevant code snippets or error messages

Please check if an issue already exists before opening a new one.

## DEVELOPMENT WORKFLOW

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch from main
4. Make your changes
5. Ensure tests pass (if any) and code builds successfully
6. Commit your changes with clear commit messages
7. Push to your fork and submit a pull request

## CODE STYLE

- Use TypeScript for all new code
- Follow the existing code patterns in the repository
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

## TESTING

Before submitting a pull request:

- Ensure the TypeScript compiles without errors: `npm run build`
- Test your changes manually in a Chrome extension environment
- Verify that retry logic works correctly with different backoff strategies

## LICENSE

By contributing to extension-retry, you agree that your contributions will be licensed under the MIT License.
