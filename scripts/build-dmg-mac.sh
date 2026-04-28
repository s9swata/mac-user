#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${APP_DIR}"

# Keep local builds unsigned by default unless caller explicitly overrides.
export CSC_IDENTITY_AUTO_DISCOVERY="${CSC_IDENTITY_AUTO_DISCOVERY:-false}"

echo "[build] Installing dependencies..."
npm install

echo "[build] Building universal macOS DMG..."
npm run dist:mac:universal

echo "[done] DMG files in ${APP_DIR}/release"
ls -lh "${APP_DIR}"/release/*.dmg
