const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TMP = path.join(ROOT, 'tmp-admin-dashboard');
const DEST = path.join(ROOT, 'client', 'public', 'admin-dashboard.zip');

const FILES = [
  // ── Frontend: Dashboard pages ──
  { src: 'client/src/pages/Dashboard/index.jsx', dest: 'client/src/pages/Dashboard/index.jsx' },
  { src: 'client/src/pages/Dashboard/DashboardPage.jsx', dest: 'client/src/pages/Dashboard/DashboardPage.jsx' },
  { src: 'client/src/pages/Dashboard/OverviewTab.jsx', dest: 'client/src/pages/Dashboard/OverviewTab.jsx' },
  { src: 'client/src/pages/Dashboard/UploadManagementtab.jsx', dest: 'client/src/pages/Dashboard/UploadManagementtab.jsx' },
  { src: 'client/src/pages/Dashboard/GoogleDriveIntegrationTab.jsx', dest: 'client/src/pages/Dashboard/GoogleDriveIntegrationTab.jsx' },
  { src: 'client/src/pages/Dashboard/SettingsTab.jsx', dest: 'client/src/pages/Dashboard/SettingsTab.jsx' },
  { src: 'client/src/pages/Dashboard/ActivityLogsTab.jsx', dest: 'client/src/pages/Dashboard/ActivityLogsTab.jsx' },

  // ── Frontend: Demo dashboard ──
  { src: 'client/src/pages/DemoDashboard.jsx', dest: 'client/src/pages/DemoDashboard.jsx' },
  { src: 'client/src/pages/demo-dashboard/DemoOverviewTab.jsx', dest: 'client/src/pages/demo-dashboard/DemoOverviewTab.jsx' },
  { src: 'client/src/pages/demo-dashboard/DemoUploadManagementtab.jsx', dest: 'client/src/pages/demo-dashboard/DemoUploadManagementtab.jsx' },
  { src: 'client/src/pages/demo-dashboard/DemoGoogleDriveIntegrationTab.jsx', dest: 'client/src/pages/demo-dashboard/DemoGoogleDriveIntegrationTab.jsx' },
  { src: 'client/src/pages/demo-dashboard/DemoSettingsTab.jsx', dest: 'client/src/pages/demo-dashboard/DemoSettingsTab.jsx' },
  { src: 'client/src/pages/demo-dashboard/DemoActivityLogsTab.jsx', dest: 'client/src/pages/demo-dashboard/DemoActivityLogsTab.jsx' },

  // ── Frontend: Redux slices ──
  { src: 'client/src/features/settings/settingsSlice.js', dest: 'client/src/features/settings/settingsSlice.js' },
  { src: 'client/src/features/drives/drivesSlice.js', dest: 'client/src/features/drives/drivesSlice.js' },
  { src: 'client/src/features/files/filesSlice.js', dest: 'client/src/features/files/filesSlice.js' },
  { src: 'client/src/features/activities/activitiesSlice.js', dest: 'client/src/features/activities/activitiesSlice.js' },
  { src: 'client/src/features/auth/authSlice.js', dest: 'client/src/features/auth/authSlice.js' },

  // ── Frontend: Lib / utils ──
  { src: 'client/src/lib/api.js', dest: 'client/src/lib/api.js' },
  { src: 'client/src/lib/utils.js', dest: 'client/src/lib/utils.js' },
  { src: 'client/src/lib/socket.js', dest: 'client/src/lib/socket.js' },
  { src: 'client/src/store.js', dest: 'client/src/store.js' },

  // ── Frontend: App entry & main ──
  { src: 'client/src/App.jsx', dest: 'client/src/App.jsx' },
  { src: 'client/src/main.jsx', dest: 'client/src/main.jsx' },
  { src: 'client/src/index.css', dest: 'client/src/index.css' },

  // ── Frontend: Layout (navbar with Download button) ──
  { src: 'client/src/components/layout/navbar.jsx', dest: 'client/src/components/layout/navbar.jsx' },
  { src: 'client/src/components/layout/footer.jsx', dest: 'client/src/components/layout/footer.jsx' },
  { src: 'client/src/components/layout/mobile-nav.jsx', dest: 'client/src/components/layout/mobile-nav.jsx' },
  { src: 'client/src/components/layout/page-transition.jsx', dest: 'client/src/components/layout/page-transition.jsx' },

  // ── Frontend: Home page (upload button UI) ──
  { src: 'client/src/pages/home/HomePage.jsx', dest: 'client/src/pages/home/HomePage.jsx' },
  { src: 'client/src/pages/DocsPage.jsx', dest: 'client/src/pages/DocsPage.jsx' },

  // ── Frontend: Auth pages ──
  { src: 'client/src/pages/auth/LoginPage.jsx', dest: 'client/src/pages/auth/LoginPage.jsx' },
  { src: 'client/src/pages/auth/RegisterPage.jsx', dest: 'client/src/pages/auth/RegisterPage.jsx' },

  // ── Frontend: Other global components ──
  { src: 'client/src/components/Splash.jsx', dest: 'client/src/components/Splash.jsx' },
  { src: 'client/src/components/MuiProvider.jsx', dest: 'client/src/components/MuiProvider.jsx' },
  { src: 'client/src/components/ThreeBackground.jsx', dest: 'client/src/components/ThreeBackground.jsx' },

  // ── Frontend: UI components ──
  { src: 'client/src/components/ui/button.jsx', dest: 'client/src/components/ui/button.jsx' },

  // ── Backend: Routes ──
  { src: 'routes/settings.routes.js', dest: 'routes/settings.routes.js' },
  { src: 'routes/drive.routes.js', dest: 'routes/drive.routes.js' },
  { src: 'routes/file.routes.js', dest: 'routes/file.routes.js' },
  { src: 'routes/activity.routes.js', dest: 'routes/activity.routes.js' },
  { src: 'routes/user.routes.js', dest: 'routes/user.routes.js' },

  // ── Backend: Models ──
  { src: 'models/settings.model.js', dest: 'models/settings.model.js' },
  { src: 'models/drive.model.js', dest: 'models/drive.model.js' },
  { src: 'models/files.model.js', dest: 'models/files.model.js' },
  { src: 'models/activity.model.js', dest: 'models/activity.model.js' },
  { src: 'models/user.model.js', dest: 'models/user.model.js' },

  // ── Backend: Middlewares ──
  { src: 'middlewares/auth.js', dest: 'middlewares/auth.js' },
  { src: 'middlewares/requireAdmin.js', dest: 'middlewares/requireAdmin.js' },

  // ── Backend: Services ──
  { src: 'services/googleDrive.service.js', dest: 'services/googleDrive.service.js' },
  { src: 'services/driveManager.service.js', dest: 'services/driveManager.service.js' },
  { src: 'services/activity.service.js', dest: 'services/activity.service.js' },
  { src: 'services/email.service.js', dest: 'services/email.service.js' },

  // ── Backend: Config ──
  { src: 'config/admin.js', dest: 'config/admin.js' },
  { src: 'config/crypto.js', dest: 'config/crypto.js' },
  { src: 'config/googleDrive.js', dest: 'config/googleDrive.js' },
  { src: 'config/multer.config.js', dest: 'config/multer.config.js' },
  { src: 'config/db.js', dest: 'config/db.js' },
  { src: 'config/socket.js', dest: 'config/socket.js' },

  // ── Frontend: Config files ──
  { src: 'client/vite.config.js', dest: 'client/vite.config.js' },
  { src: 'client/tailwind.config.js', dest: 'client/tailwind.config.js' },
  { src: 'client/postcss.config.js', dest: 'client/postcss.config.js' },
  { src: 'client/index.html', dest: 'client/index.html' },
  { src: 'client/package.json', dest: 'client/package.json' },

  // ── Backend: Entry ──
  { src: 'app.js', dest: 'app.js' },
  { src: 'package.json', dest: 'package.json' },
];

function copyFile(src, dest) {
  const srcPath = path.join(ROOT, src);
  const destPath = path.join(TMP, dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(srcPath, destPath);
}

console.log('Building admin-dashboard.zip...');

// Clean temp dir
if (fs.existsSync(TMP)) fs.rmSync(TMP, { recursive: true });

// Copy all files
for (const f of FILES) {
  const srcPath = path.join(ROOT, f.src);
  if (!fs.existsSync(srcPath)) {
    console.warn(`  ⚠ SKIP (not found): ${f.src}`);
    continue;
  }
  copyFile(f.src, f.dest);
  console.log(`  ✓ ${f.src}`);
}

// Copy .env.example
const envExample = path.join(ROOT, '.env.example');
if (fs.existsSync(envExample)) {
  copyFile('.env.example', '.env.example');
  console.log('  ✓ .env.example');
}

// Create ZIP using PowerShell
const zipCmd = `powershell -NoProfile -Command "& { Compress-Archive -Path '${TMP}\\*' -DestinationPath '${DEST}' -Force }"`;
console.log('\nCreating ZIP...');
execSync(zipCmd, { stdio: 'inherit' });

// Cleanup
fs.rmSync(TMP, { recursive: true });

console.log(`\n✅ Done! ZIP created at: client/public/admin-dashboard.zip`);
console.log(`   Size: ${(fs.statSync(DEST).size / 1024 / 1024).toFixed(2)} MB`);
