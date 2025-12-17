# Guía Paso a Paso: Generar Claves de Firma y Secretos para Android

Esta guía te mostrará cómo generar una clave de firma para tu aplicación Android, un requisito indispensable para publicar en la Google Play Store, y cómo convertir esa clave en los secretos que necesita el workflow de GitHub Actions.

**IMPORTANTE:** La clave que generarás es la identidad digital de tu app. **Si la pierdes, no podrás volver a publicar actualizaciones de tu aplicación.** Guárdala en un lugar seguro y privado, fuera del repositorio de código.

---

### Prerrequisitos: Verificar Java Development Kit (JDK)

Necesitas tener instalado el JDK de Java (versión 11 o superior). Para verificarlo, abre una terminal (PowerShell o CMD) y ejecuta:

```bash
java -version
```

Si ves un número de versión, estás listo. También verifica que `keytool` (la herramienta para crear claves) esté disponible:

```bash
keytool -help
```

Si alguno de estos comandos no funciona, deberás instalar el JDK de Android Studio desde `File > Settings > Build, Execution, Deployment > Build Tools > Gradle` y asegurarte de que esté en el PATH de tu sistema.

---

### Paso 1: Generar el Archivo Keystore

El `keystore` es un archivo encriptado que contiene tu clave de firma privada.

1.  **Abre una terminal de PowerShell** en la raíz de tu proyecto `Inventariando`.

2.  **Prepara tus contraseñas y tu alias.** Elige un alias (un nombre corto para tu clave) y dos contraseñas seguras.
    *   **Alias:** `inventariando` (recomendado)
    *   **Contraseña del Keystore:** Elige una contraseña segura.
    *   **Contraseña de la Clave:** Elige otra contraseña segura (puede ser la misma que la del keystore).

3.  **Ejecuta el siguiente comando `keytool`**. Reemplaza `TU_CONTRASENA_KEYSTORE` y `TU_CONTRASENA_CLAVE` con las que elegiste. El comando creará el archivo en `android/app/inventariando.keystore`.

    ```powershell
    keytool -genkey -v -keystore android/app/inventariando.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias inventariando -storepass TU_CONTRASENA_KEYSTORE -keypass TU_CONTRASENA_CLAVE
    ```

4.  **Responde las preguntas:** `keytool` te pedirá información para el "Distinguished Name" (Nombre Distinguido). Esto se usa para identificar al dueño de la clave.
    *   **What is your first and last name?**: Tu nombre y apellido.
    *   **What is the name of your organizational unit?**: `Development` o el nombre de tu equipo.
    *   **What is the name of your organization?**: El nombre de tu empresa o proyecto (ej: `Inventariando`).
    *   **What is the name of your City or Locality?**: Tu ciudad (ej: `Buenos Aires`).
    *   **What is the name of your State or Province?**: Tu provincia (ej: `Buenos Aires`).
    *   **What is the two-letter country code for this unit?**: `AR`

    Al final, te pedirá confirmar si los datos son correctos. Escribe `yes` y presiona Enter.

¡Felicidades! Se habrá creado el archivo `android\app\inventariando.keystore`.

---

### Paso 2: Añadir el Keystore al `.gitignore` (MUY IMPORTANTE)

Para evitar subir tu clave privada al repositorio de código, añade la siguiente línea al final de tu archivo `.gitignore` en la raíz del proyecto:

```
# Keystore privado - NO COMMITEAR
*.keystore
```

---

### Paso 3: Generar los Valores para los Secretos de GitHub

Ahora, usaremos el archivo `.keystore` y tus contraseñas para generar los cuatro valores que necesitas para los secretos de GitHub Actions.

1.  **`ANDROID_KEYSTORE_PASSWORD`**:
    *   **Valor:** La `TU_CONTRASENA_KEYSTORE` que elegiste en el Paso 1.

2.  **`ANDROID_KEY_PASSWORD`**:
    *   **Valor:** La `TU_CONTRASENA_CLAVE` que elegiste en el Paso 1.

3.  **`ANDROID_KEY_ALIAS`**:
    *   **Valor:** `inventariando` (o el alias que hayas elegido).

4.  **`ANDROID_KEYSTORE_BASE64`**:
    *   Este es el contenido de tu archivo `.keystore` codificado en formato Base64.
    *   En la misma terminal de PowerShell, ejecuta el siguiente comando:

        ```powershell
        [Convert]::ToBase64String([IO.File]::ReadAllBytes("android\app\inventariando.keystore"))
        ```
    *   **Valor:** El comando generará un bloque de texto muy largo. **Copia todo ese bloque de texto.** Ese es el valor para tu secreto.

---

### Paso 4: Configurar los Secretos en GitHub

1.  Ve a la configuración de tu repositorio: `https://github.com/LEO-UNAHUR/Inventariando/settings/secrets/actions`.
2.  Haz clic en **"New repository secret"** por cada uno de los cuatro secretos.
3.  Pega los nombres y los valores que acabas de generar. Asegúrate de que no haya espacios en blanco al principio o al final de los valores que pegues.

---

### Paso 5: ¡Hacer una Copia de Seguridad!

Este es el paso final y más importante para tu seguridad a largo plazo:

1.  **Copia el archivo `inventariando.keystore`** a un lugar seguro **FUERA** de tu proyecto (ej: un gestor de contraseñas, un disco USB encriptado, etc.).
2.  **Guarda las dos contraseñas y el alias** junto con el archivo.

Has completado el proceso. Tu CI/CD ahora tiene todo lo necesario para firmar tus APKs y publicarlos.
