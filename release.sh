#!/usr/bin/env bash
# ===================================
# RELEASE SCRIPT - Cross-platform wrapper
# ===================================
# 
# Uso:
#   ./release.sh beta
#   ./release.sh stable
# 
# O en PowerShell:
#   & '.\release.ps1' beta
#   & '.\release.ps1' stable

if [ -z "$1" ]; then
    echo "❌ Especifica el tipo de release: beta o stable"
    echo "Uso: ./release.sh [beta|stable]"
    exit 1
fi

# Validar tipo de release
if [ "$1" != "beta" ] && [ "$1" != "stable" ]; then
    echo "❌ Tipo de release inválido: $1"
    echo "Opciones válidas: beta, stable"
    exit 1
fi

# Ejecutar release automático
echo "🚀 Iniciando release automático: $1"
node scripts/release-auto.js "$1"
