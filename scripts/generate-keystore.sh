#!/bin/bash

# Script para generar keystore si no existe
# Usado en GitHub Actions para CI/CD

KEYSTORE_PATH="android/app/inventariando.keystore"
STORE_PASS="inventariando2024"
KEY_PASS="inventariando2024"
KEY_ALIAS="inventariando"

if [ ! -f "$KEYSTORE_PATH" ]; then
  echo "📝 Generando keystore para firma de APK..."
  
  # Usar Java's keytool
  keytool -genkey -v \
    -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias "$KEY_ALIAS" \
    -storepass "$STORE_PASS" \
    -keypass "$KEY_PASS" \
    -dname "CN=Inventariando, OU=IT, O=Inventariando, L=Buenos Aires, ST=Buenos Aires, C=AR"
  
  if [ $? -eq 0 ]; then
    echo "✅ Keystore generado exitosamente"
  else
    echo "❌ Error generando keystore"
    exit 1
  fi
else
  echo "✅ Keystore ya existe"
fi
