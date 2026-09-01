# Himnario Ebenezer - Android APK

Wrapper WebView que carga la app web desde Netlify.

## Requisitos
- Android Studio o Android SDK (API 34)
- Java 8+

## Build APK

### Opción 1: Android Studio
1. Abrir `android/` en Android Studio
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. El APK queda en `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 2: Línea de comandos
```bash
cd android
gradlew.bat assembleDebug
```
El APK se genera en `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 3: Release (firmado)
```bash
cd android
gradlew.bat assembleRelease
```
Para firmar, crear `android/key.properties` y configurar signing en `app/build.gradle`.

## Cómo funciona
- WebView carga `https://ebenezer-hymnal.netlify.app/`
- JavaScript y DOM Storage habilitados
- Cada actualización de Netlify se refleja automáticamente en la app
- Pantalla completa sin barra de título
- Barra de progreso dorada (#C9A227)
- Botón atrás navega hacia atrás en el WebView

## Personalización
- URL: cambiar en `MainActivity.java` → `private static final String URL`
- Nombre: cambiar en `AndroidManifest.xml` → `android:label`
- Icono: reemplazar `res/mipmap-*/ic_launcher.png`
