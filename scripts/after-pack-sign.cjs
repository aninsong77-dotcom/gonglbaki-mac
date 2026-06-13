// 핵심 수정: Electron이 "Electron Helper.app" 이름으로 헬퍼를 찾음.
// electron-builder가 곤글박이 Helper.app으로 이름을 바꿔버려서 충돌 발생.
// 원본 Electron Helper.app들을 Frameworks에 추가해 해결.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

function copyRecursive(src, dst) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const dstPath = path.join(dst, entry.name);
        if (entry.isDirectory()) {
            copyRecursive(srcPath, dstPath);
        } else {
            fs.copyFileSync(srcPath, dstPath);
            // 실행 권한 복사
            const srcMode = fs.statSync(srcPath).mode;
            fs.chmodSync(dstPath, srcMode);
        }
    }
}

exports.default = async function afterPack(context) {
    if (process.platform !== 'darwin') return;

    const productName = context.packager.appInfo.productName;
    const appPath = path.join(context.appOutDir, `${productName}.app`);
    const frameworksDir = path.join(appPath, 'Contents', 'Frameworks');

    // 원본 Electron Helper.app 위치 (node_modules)
    const electronDistDir = path.join(__dirname, '..', 'node_modules', 'electron', 'dist', 'Electron.app', 'Contents', 'Frameworks');

    const helpers = [
        'Electron Helper.app',
        'Electron Helper (GPU).app',
        'Electron Helper (Plugin).app',
        'Electron Helper (Renderer).app',
    ];

    for (const helper of helpers) {
        const src = path.join(electronDistDir, helper);
        const dst = path.join(frameworksDir, helper);
        if (!fs.existsSync(dst)) {
            console.log(`[헬퍼] 추가: ${helper}`);
            copyRecursive(src, dst);
        }
    }

    // ASAR 해시 재계산 후 Info.plist 업데이트
    const asarPath = path.join(appPath, 'Contents', 'Resources', 'app.asar');
    const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
    const asarData = fs.readFileSync(asarPath);
    const actualHash = crypto.createHash('sha256').update(asarData).digest('hex');
    let plist = fs.readFileSync(infoPlistPath, 'utf8');
    const oldHashMatch = plist.match(/<key>hash<\/key>\s*<string>([a-f0-9]+)<\/string>/);
    if (oldHashMatch && oldHashMatch[1] !== actualHash) {
        plist = plist.replace(oldHashMatch[1], actualHash);
        fs.writeFileSync(infoPlistPath, plist, 'utf8');
        console.log(`[ASAR 해시] 업데이트: ${actualHash.substring(0,16)}...`);
    }

    // Install.command를 앱 출력 디렉토리에 복사
    const scriptSrc = path.join(__dirname, '..', 'resources', 'Install.command');
    const scriptDst = path.join(context.appOutDir, 'Install.command');
    if (fs.existsSync(scriptSrc)) {
        fs.copyFileSync(scriptSrc, scriptDst);
        fs.chmodSync(scriptDst, 0o755);
        console.log('[Install.command] 복사 완료');
    }

    console.log('[afterPack] 완료');
};
