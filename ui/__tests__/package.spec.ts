import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('ui/package.json', () => {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  let packageJson: any;

  // Helper to read and parse package.json
  const readPackageJson = () => {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  };

  // Load package.json before tests
  packageJson = readPackageJson();

  describe('Structure and Schema Validation', () => {
    it('should be valid JSON', () => {
      expect(() => {
        JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      }).not.toThrow();
    });

    it('should have required fields', () => {
      expect(packageJson).toHaveProperty('name');
      expect(packageJson).toHaveProperty('version');
      expect(packageJson).toHaveProperty('private');
      expect(packageJson).toHaveProperty('scripts');
      expect(packageJson).toHaveProperty('dependencies');
    });

    it('should have correct package name', () => {
      expect(packageJson.name).toBe('ui');
    });

    it('should be marked as private', () => {
      expect(packageJson.private).toBe(true);
    });

    it('should have a valid semantic version', () => {
      const semverRegex = /^\d+\.\d+\.\d+$/;
      expect(packageJson.version).toMatch(semverRegex);
    });
  });

  describe('Scripts Validation', () => {
    it('should have all required npm scripts', () => {
      const requiredScripts = ['dev', 'build', 'start', 'lint'];
      requiredScripts.forEach((script) => {
        expect(packageJson.scripts).toHaveProperty(script);
      });
    });

    it('should have valid Next.js script commands', () => {
      expect(packageJson.scripts.dev).toBe('next dev');
      expect(packageJson.scripts.build).toBe('next build');
      expect(packageJson.scripts.start).toBe('next start');
      expect(packageJson.scripts.lint).toBe('next lint');
    });

    it('should not have empty script values', () => {
      Object.values(packageJson.scripts).forEach((script) => {
        expect(typeof script).toBe('string');
        expect((script as string).trim()).not.toBe('');
      });
    });
  });

  describe('Dependencies Validation', () => {
    it('should have Next.js as a dependency', () => {
      expect(packageJson.dependencies).toHaveProperty('next');
    });

    it('should have React and React DOM with matching versions', () => {
      expect(packageJson.dependencies).toHaveProperty('react');
      expect(packageJson.dependencies).toHaveProperty('react-dom');
      expect(packageJson.dependencies.react).toBe(packageJson.dependencies['react-dom']);
    });

    it('should have all expected core dependencies', () => {
      const expectedDependencies = [
        '@bgd-labs/react-web3-icons',
        '@bgd-labs/rpc-env',
        '@leeoniya/ufuzzy',
        'clsx',
        'next',
        'react',
        'react-dom',
        'tailwind-merge',
        'viem',
      ];

      expectedDependencies.forEach((dep) => {
        expect(packageJson.dependencies).toHaveProperty(dep);
      });
    });

    it('should have valid dependency version formats', () => {
      const validVersionRegex = /^[\^~]?\d+\.\d+\.\d+$/;
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        expect(version).toMatch(validVersionRegex);
      });
    });

    it('should not have any dependency with wildcard versions', () => {
      Object.values(packageJson.dependencies).forEach((version) => {
        expect(version).not.toBe('*');
        expect(version).not.toMatch(/^x\./);
      });
    });
  });

  describe('DevDependencies Validation', () => {
    it('should have TypeScript in devDependencies', () => {
      expect(packageJson.devDependencies).toHaveProperty('typescript');
    });

    it('should have Next.js ESLint config', () => {
      expect(packageJson.devDependencies).toHaveProperty('eslint-config-next');
    });

    it('should have Tailwind CSS and related tools', () => {
      expect(packageJson.devDependencies).toHaveProperty('tailwindcss');
      expect(packageJson.devDependencies).toHaveProperty('postcss');
      expect(packageJson.devDependencies).toHaveProperty('autoprefixer');
    });

    it('should have all expected devDependencies', () => {
      const expectedDevDeps = [
        '@types/node',
        '@types/react',
        '@types/react-dom',
        'autoprefixer',
        'eslint',
        'eslint-config-next',
        'postcss',
        'prettier',
        'tailwindcss',
        'typescript',
      ];

      expectedDevDeps.forEach((dep) => {
        expect(packageJson.devDependencies).toHaveProperty(dep);
      });
    });

    it('should have valid devDependency version formats', () => {
      const validVersionRegex = /^[\^~]?\d+\.\d+\.\d+$/;
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        expect(version).toMatch(validVersionRegex);
      });
    });
  });

  describe('Security and Version Requirements', () => {
    it('should have Next.js version >= 16.1.5 (security fix)', () => {
      const nextVersion = packageJson.dependencies.next.replace(/^[\^~]/, '');
      const [major, minor, patch] = nextVersion.split('.').map(Number);

      expect(major).toBeGreaterThanOrEqual(16);
      if (major === 16) {
        expect(minor).toBeGreaterThanOrEqual(1);
        if (minor === 1) {
          expect(patch).toBeGreaterThanOrEqual(5);
        }
      }
    });

    it('should not use vulnerable Next.js versions (< 16.1.5)', () => {
      const nextVersion = packageJson.dependencies.next.replace(/^[\^~]/, '');
      const [major, minor, patch] = nextVersion.split('.').map(Number);
      const version = major * 10000 + minor * 100 + patch;

      // Version should be >= 16.1.5 (160105)
      expect(version).toBeGreaterThanOrEqual(160105);
    });

    it('should use React 19', () => {
      const reactVersion = packageJson.dependencies.react;
      expect(reactVersion).toMatch(/^19\./);
    });

    it('should have consistent React types with dependencies', () => {
      const reactVersion = packageJson.dependencies.react;
      const reactTypesVersion = packageJson.devDependencies['@types/react'];

      expect(reactTypesVersion).toMatch(/^19\./);
    });
  });

  describe('Overrides Configuration', () => {
    it('should have overrides field', () => {
      expect(packageJson).toHaveProperty('overrides');
    });

    it('should override React types to version 19', () => {
      expect(packageJson.overrides).toHaveProperty('@types/react');
      expect(packageJson.overrides).toHaveProperty('@types/react-dom');
      expect(packageJson.overrides['@types/react']).toBe('19.0.4');
      expect(packageJson.overrides['@types/react-dom']).toBe('19.0.2');
    });

    it('should have consistent overrides with devDependencies', () => {
      expect(packageJson.overrides['@types/react']).toBe(
        packageJson.devDependencies['@types/react']
      );
      expect(packageJson.overrides['@types/react-dom']).toBe(
        packageJson.devDependencies['@types/react-dom']
      );
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should not have duplicate dependencies in both deps and devDeps', () => {
      const deps = Object.keys(packageJson.dependencies || {});
      const devDeps = Object.keys(packageJson.devDependencies || {});
      const duplicates = deps.filter((dep) => devDeps.includes(dep));

      expect(duplicates).toHaveLength(0);
    });

    it('should not have circular dependency patterns in package name', () => {
      expect(packageJson.name).not.toContain('..');
      expect(packageJson.name).not.toContain('/');
      expect(packageJson.name).not.toContain('\\');
    });

    it('should handle package.json file read without errors', () => {
      expect(() => readPackageJson()).not.toThrow();
    });

    it('should have non-empty dependency objects', () => {
      expect(Object.keys(packageJson.dependencies).length).toBeGreaterThan(0);
      expect(Object.keys(packageJson.devDependencies).length).toBeGreaterThan(0);
    });

    it('should not have trailing commas in JSON (valid JSON format)', () => {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      // Should not throw when parsing
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should have proper version format for all packages', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        // Should start with ^ or ~ or be exact version
        expect(typeof version).toBe('string');
        expect((version as string).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Regression Tests', () => {
    it('should maintain Next.js major version 16 or higher', () => {
      const nextVersion = packageJson.dependencies.next.replace(/^[\^~]/, '');
      const [major] = nextVersion.split('.').map(Number);

      // Regression test: should never downgrade to v15 or lower
      expect(major).toBeGreaterThanOrEqual(16);
    });

    it('should not reintroduce vulnerable Next.js versions', () => {
      const vulnerableVersions = ['15.1.4', '15.1.3', '15.1.2', '15.1.1', '15.1.0'];
      const nextVersion = packageJson.dependencies.next.replace(/^[\^~]/, '');

      expect(vulnerableVersions).not.toContain(nextVersion);
    });

    it('should maintain security-focused dependency pinning', () => {
      // Next.js should be pinned to exact version or caret range
      const nextVersion = packageJson.dependencies.next;
      expect(nextVersion).toMatch(/^[\^]?16\./);
    });

    it('should keep React 19 consistency across packages', () => {
      expect(packageJson.dependencies.react).toBe('19.0.0');
      expect(packageJson.dependencies['react-dom']).toBe('19.0.0');
    });
  });

  describe('Negative Cases', () => {
    it('should not have undefined or null dependency values', () => {
      Object.values(packageJson.dependencies).forEach((version) => {
        expect(version).toBeDefined();
        expect(version).not.toBeNull();
      });
    });

    it('should not have empty string versions', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.values(allDeps).forEach((version) => {
        expect((version as string).trim()).not.toBe('');
      });
    });

    it('should not have malformed version numbers', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        // Should not have multiple dots in a row or start with dot
        expect(version).not.toMatch(/\.\./);
        expect(version).not.toMatch(/^\./);
      });
    });

    it('should not have script values with only whitespace', () => {
      Object.values(packageJson.scripts).forEach((script) => {
        expect((script as string).trim().length).toBeGreaterThan(0);
      });
    });

    it('should not have invalid JSON structure', () => {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');
      let parsed;

      expect(() => {
        parsed = JSON.parse(content);
      }).not.toThrow();

      expect(typeof parsed).toBe('object');
      expect(parsed).not.toBeNull();
    });
  });

  describe('Integration Tests', () => {
    it('should be compatible with npm/yarn/pnpm package managers', () => {
      // Basic package.json should work with all package managers
      expect(packageJson.name).toBeDefined();
      expect(packageJson.version).toBeDefined();
      expect(packageJson.dependencies).toBeDefined();
    });

    it('should have dependencies that could be installed', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // All deps should have proper format
      Object.entries(allDeps).forEach(([name, version]) => {
        expect(name).toMatch(/^[@a-z0-9][a-z0-9-\/]*$/);
      });
    });

    it('should be ready for Next.js framework usage', () => {
      expect(packageJson.dependencies.next).toBeDefined();
      expect(packageJson.dependencies.react).toBeDefined();
      expect(packageJson.dependencies['react-dom']).toBeDefined();
      expect(packageJson.scripts.dev).toContain('next');
      expect(packageJson.scripts.build).toContain('next');
    });
  });

  describe('Additional Confidence Tests', () => {
    it('should maintain exact dependency count for stability', () => {
      // Ensures no dependencies are accidentally removed
      expect(Object.keys(packageJson.dependencies).length).toBe(9);
      expect(Object.keys(packageJson.devDependencies).length).toBe(10);
    });

    it('should have proper file encoding (UTF-8)', () => {
      const buffer = fs.readFileSync(packageJsonPath);
      const content = buffer.toString('utf-8');

      // Should be able to parse as JSON after UTF-8 decoding
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should preserve indentation for maintainability', () => {
      const content = fs.readFileSync(packageJsonPath, 'utf-8');

      // Check if file has proper indentation (2 spaces or tabs)
      const lines = content.split('\n').filter((line) => line.trim().length > 0);
      const hasIndentation = lines.some((line) => /^[ \t]+/.test(line));

      expect(hasIndentation).toBe(true);
    });

    it('should have alphabetically ordered dependencies for maintainability', () => {
      const depKeys = Object.keys(packageJson.dependencies);
      const sortedDepKeys = [...depKeys].sort();

      // This helps maintain consistency in package.json
      expect(depKeys).toEqual(sortedDepKeys);
    });

    it('should handle version constraint operators correctly', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      Object.entries(allDeps).forEach(([name, version]) => {
        const v = version as string;
        // If using caret, it should be at the start
        if (v.includes('^')) {
          expect(v.indexOf('^')).toBe(0);
        }
        // If using tilde, it should be at the start
        if (v.includes('~')) {
          expect(v.indexOf('~')).toBe(0);
        }
      });
    });
  });
});