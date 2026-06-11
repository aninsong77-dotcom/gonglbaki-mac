// macOS 26(Tahoe) 시작 크래시 해결:
// electron-builder가 .app을 만든 직후, DMG 생성 전에 실행됨.
// ad-hoc 서명(-) + JIT 엔타이틀먼트로 V8 JIT 실행 허용.
const { execSync } = require('child_process');
const path = require('path');

exports.default = async function afterPack(context) {
    if (process.platform !== 'darwin') return;

    const productName = context.packager.appInfo.productName;
    const appPath = path.join(context.appOutDir, `${productName}.app`);
    const entitlements = path.join(__dirname, '..', 'entitlements.mac.plist');

    console.log(`[서명] ${appPath}`);
    execSync(
        `codesign --force --deep --sign - --entitlements "${entitlements}" --options runtime "${appPath}"`,
        { stdio: 'inherit' }
    );
    console.log('[서명] 완료');
};
