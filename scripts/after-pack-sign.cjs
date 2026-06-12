const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterSign(context) {
  if (context.packager.platform.name !== 'mac') return;

  const { appOutDir, packager } = context;
  const appName = packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);
  const entitlements = path.join(packager.projectDir, 'entitlements.mac.plist');

  // JIT 권한 포함하여 앱 전체 재서명 (allow-jit, allow-unsigned-executable-memory)
  execSync(
    `codesign --deep --force --sign - --entitlements "${entitlements}" "${appPath}"`,
    { stdio: 'inherit' }
  );
};
