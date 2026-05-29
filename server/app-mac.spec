# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_all

ct2_datas, ct2_binaries, ct2_hidden = collect_all('ctranslate2')
fw_datas, fw_binaries, fw_hidden = collect_all('faster_whisper')
tok_datas, tok_binaries, tok_hidden = collect_all('tokenizers')

a = Analysis(
    ['app.py'],
    pathex=[],
    binaries=ct2_binaries + fw_binaries + tok_binaries,
    datas=ct2_datas + fw_datas + tok_datas,
    hiddenimports=[
        'psutil',
        'huggingface_hub',
        'tqdm',
        'flask_cors',
    ] + ct2_hidden + fw_hidden + tok_hidden,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)
exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='app',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
coll = COLLECT(
    exe,
    a.binaries,
    a.datas,
    strip=False,
    upx=False,
    upx_exclude=[],
    name='app',
)
