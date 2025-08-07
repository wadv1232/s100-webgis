# Tools Directory

This directory contains various tools and utilities used throughout the project.

## Folder Structure

### commit-tools/
- `auto-commit.js` - Node.js script for automated Git commits
- `commit.sh` - Shell script for automated Git commits
- `auto-commit.sh` - Alternative shell script for automated commits

### scripts/
- `update-mock-data.js` - Script for updating mock data in the project

## Usage

### Auto-commit Tools
To use the auto-commit functionality:
```bash
# Using the Node.js script
cd tools/commit-tools
node auto-commit.js

# Using the shell script
cd tools/commit-tools
./commit.sh

# Or using the npm command from project root
npm run commit
```

### Mock Data Script
To update mock data:
```bash
cd tools/scripts
node update-mock-data.js
```

## Adding New Tools
When adding new tools to this directory:
1. Place them in the appropriate subfolder
2. Update this README with documentation
3. Ensure proper permissions are set for executable scripts
4. Add any necessary dependencies to package.json