// generate-nextjs-admin.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectName = 'betasafar-admin-frontend';
const root = path.join(process.cwd(), projectName);

console.log(`🚀 Creating Betasafar Admin Frontend: ${projectName}\n`);

// Create root
if (fs.existsSync(root)) {
  console.log(`${projectName} already exists — skipping`);
} else {
  fs.mkdirSync(root);
}

// Folders structure
const folders = [
  'app',
  'app/(auth)',
  'app/(auth)/login',
  'app/(auth)/change-password',
  'app/(dashboard)',
  'app/(dashboard)/layout',
  'app/(dashboard)/operators',
  'app/(dashboard)/operators/pending',
  'app/(dashboard)/operators/all',
  'app/(dashboard)/packages',
  'app/(dashboard)/payouts',
  'app/(dashboard)/stats',
  'app/(dashboard)/users',
  'app/(dashboard)/advisor',
  'app/api',
  'app/api/auth',
  'app/api/operators',
  'app/api/payouts',
  'components',
  'components/ui',
  'components/layout',
  'components/operators',
  'components/packages',
  'components/payouts',
  'components/stats',
  'components/auth',
  'lib',
  'lib/api',
  'lib/auth',
  'hooks',
  'types',
  'styles',
  'public',
  'public/images',
  'scripts',
];

folders.forEach(folder => {
  const fullPath = path.join(root, folder);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`📁 Created: ${folder}`);
});

// package.json
const packageJson = {
  name: projectName,
  version: "1.0.0",
  private: true,
  scripts: {
    dev: "next dev",
    build: "next build",
    start: "next start",
    lint: "next lint",
  },
  dependencies: {
    next: "14.2.3",
    react: "18",
    "react-dom": "18",
    "@tanstack/react-query": "^5.0.0",
    axios: "^1.6.0",
    "jwt-decode": "^4.0.0",
    "recharts": "^2.10.0",
    "lucide-react": "^0.292.0",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
  },
  devDependencies: {
    typescript: "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    eslint: "^8",
    "eslint-config-next": "14.2.3",
    tailwindcss: "^3.3.0",
    postcss: "^8",
    autoprefixer: "^10",
  },
};

fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2));
console.log('📦 Created: package.json');

// next.config.js
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['res.cloudinary.com'],
  },
};

module.exports = nextConfig;
`;

fs.writeFileSync(path.join(root, 'next.config.js'), nextConfig.trim() + '\n');
console.log('⚙️ Created: next.config.js');

// tailwind.config.ts
const tailwindConfig = `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD700', // Gold
        secondary: '#1a1a1a', // Dark
        accent: '#00A676',
      },
    },
  },
  plugins: [],
}

export default config
`;

fs.writeFileSync(path.join(root, 'tailwind.config.ts'), tailwindConfig.trim() + '\n');
console.log('🎨 Created: tailwind.config.ts');

// tsconfig.json
const tsconfig = {
  compilerOptions: {
    target: "es5",
    lib: ["dom", "dom.iterable", "esnext"],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    forceConsistentCasingInFileNames: true,
    noEmit: true,
    esModuleInterop: true,
    module: "esnext",
    moduleResolution: "node",
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: "preserve",
    incremental: true,
    baseUrl: ".",
    paths: {
      "@/*": ["./*"],
      "@/components/*": ["components/*"],
      "@/lib/*": ["lib/*"],
      "@/types/*": ["types/*"],
      "@/hooks/*": ["hooks/*"],
    },
  },
  include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  exclude: ["node_modules"],
};

fs.writeFileSync(path.join(root, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
console.log('⚙️ Created: tsconfig.json');

// Placeholder files
const placeholders = [
  'app/globals.css',
  'app/layout.tsx',
  'app/page.tsx',
  'components/layout/Sidebar.tsx',
  'components/layout/Header.tsx',
  'components/layout/Layout.tsx',
  'components/ui/Button.tsx',
  'components/ui/Card.tsx',
  'components/ui/Table.tsx',
  'components/ui/Modal.tsx',
  'lib/api/client.ts',
  'lib/auth/auth.ts',
  'types/index.ts',
  'hooks/useAuth.ts',
  'hooks/useApi.ts',
];

placeholders.forEach(file => {
  const fullPath = path.join(root, file);
  const content = file.endsWith('.tsx') 
    ? `// ${path.basename(file)} - TODO: Implement\n\nexport default function ${path.basename(file, '.tsx').replace(/-/g, '')}() {\n  return <div>${path.basename(file)}</div>\n}\n`
    : `/* ${path.basename(file)} - TODO */\n`;
  fs.writeFileSync(fullPath, content);
  console.log(`📄 Created placeholder: ${file}`);
});

console.log('\n🎉 Betasafar Admin Frontend boilerplate created successfully!');
console.log('\nNext steps:');
console.log(`1. cd ${projectName}`);
console.log('2. npm install');
console.log('3. npm run dev');
console.log('4. Start building the real components!');
console.log('\nAdmin modules ready:');
console.log('   • Authentication (login, change password)');
console.log('   • Operators (pending, all)');
console.log('   • Packages overview');
console.log('   • Payouts management');
console.log('   • Platform stats');
console.log('   • Users & Advisor monitoring');
console.log('\nYou now have a professional Next.js 14 admin panel structure!');