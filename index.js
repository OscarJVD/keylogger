const { app, BrowserWindow, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs'); // Importar el módulo fs

let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false, // Inicia con la ventana oculta
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // Asegúrate de entender las implicaciones de seguridad de esto
        }
    });

    mainWindow.loadFile('main_window.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createOrEditFile() {
    const filePath = path.join(__dirname, 'mensaje.txt'); // Define la ruta del archivo

    // Escribe o sobreescribe el archivo con el texto 'hola'
    fs.writeFile(filePath, 'hola', (err) => {
        if (err) throw err;
        console.log('El archivo ha sido creado o modificado con éxito.');
    });
}

app.whenReady().then(() => {
    createWindow();

    // Registrar un atajo de teclado global para 'a'
    globalShortcut.register('a', () => {
        console.log('Tecla "a" presionada');
        createOrEditFile();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Crea el icono en la bandeja del sistema
    tray = new Tray(path.join(__dirname, 'icon.png')); // Asegúrate de tener un icono 'icon.png' en tu directorio
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar', click: () => mainWindow.show() },
        { label: 'Salir', click: () => app.quit() }
    ]);
    tray.setToolTip('Tu aplicación Electron en segundo plano.');
    tray.setContextMenu(contextMenu);

    // Ocultar la ventana en vez de cerrar
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }

        return false;
    });
});

app.on('window-all-closed', () => {
    // Desregistrar todos los atajos al cerrar la aplicación
    globalShortcut.unregisterAll();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});
