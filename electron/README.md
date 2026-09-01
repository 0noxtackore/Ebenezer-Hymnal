# Himnario Ebenezer - Desktop (Electron)

Wrapper Electron que carga la app web desde Netlify.
Genera instaladores para Windows, macOS y Linux.

## Requisitos
- Node.js 18+
- npm

## Instalación
```bash
cd electron
npm install
```

## Ejecutar (desarrollo)
```bash
npm start
```

## Generar instaladores

### Windows (.exe)
```bash
npm run build-win
```
Resultado: `electron/dist/Himnario Ebenezer Setup.exe`

### macOS (.dmg)
```bash
npm run build-mac
```
Resultado: `electron/dist/Himnario Ebenezer.dmg`

### Linux (.AppImage)
```bash
npm run build-linux
```
Resultado: `electron/dist/Himnario Ebenezer.AppImage`

### Todos
```bash
npm run build-all
```

## Cómo funciona
- Carga `https://ebenezer-hymnal.netlify.app/` en un BrowserWindow
- Sin barra de menú (aplicación limpia)
- Links externos se abren en el navegador del sistema
- Tamaño: 420x800 (móvil), redimensionable
- Fondo dorado #FAF8F3
- Cada actualización de Netlify se refleja automáticamente
- Links externos se abren en el navegador del sistema
