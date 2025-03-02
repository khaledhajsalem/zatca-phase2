/**
 * Build script for zatca-phase2 library
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const packageJson = require('../package.json');

console.log('Building ZATCA Phase 2 library...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Run linting
console.log('\nRunning linter...');
try {
    execSync('npm run lint', { stdio: 'inherit' });
} catch (error) {
    console.error('Linting failed!');
    process.exit(1);
}

// Run tests
console.log('\nRunning tests...');
try {
    execSync('npm test', { stdio: 'inherit' });
} catch (error) {
    console.error('Tests failed!');
    process.exit(1);
}

// Copy necessary files to dist
console.log('\nCopying files to dist...');
const filesToCopy = [
    'package.json',
    'README.md',
    'LICENSE'
];

filesToCopy.forEach(file => {
    fs.copyFileSync(path.join(__dirname, '..', file), path.join(distDir, file));
});

// Copy lib directory
console.log('Copying lib directory...');
copyDir(path.join(__dirname, '../lib'), path.join(distDir, 'lib'));

// Update package.json in dist
console.log('Updating package.json in dist...');
const distPackage = require(path.join(distDir, 'package.json'));

// Remove development-only dependencies and scripts
distPackage.devDependencies = {};
distPackage.scripts = {
    test: 'echo "Error: no test specified" && exit 1'
};

// Write updated package.json
fs.writeFileSync(
    path.join(distDir, 'package.json'),
    JSON.stringify(distPackage, null, 2)
);

console.log('\nBuild completed successfully!');
console.log(`Library version: ${packageJson.version}`);
console.log(`Output directory: ${distDir}`);

/**
 * Copy directory recursively
 * @param {string} src Source directory
 * @param {string} dest Destination directory
 */
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}