
const electron = require('electron');
const {app, ipcMain, Tray, BrowserWindow, Menu} = electron;

const path = require('path');
const url = require('url');

const settings = require('./settings');

// handle setupevents as quickly as possible
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function handleSquirrelEvent () {
    if (process.argv.length === 1) {
        return false;
    }

    const {spawn: _spawn} = require('child_process');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
    const spawn = function(command, args) {
        let spawnedProcess;

        try {
            spawnedProcess = _spawn(command, args, {
                detached: true
            });
        }
        catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(app.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            app.quit();
            return true;
    }

    return false;
}

/**
 * Initialize an Electron application.
 */
class AppElectron {

    constructor() {
        // app.dock.hide();

        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on('ready', this.createWindow);

        app.commandLine.appendSwitch('ignore-certificate-errors');

        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
            // On OS X it is common for applications and their menu bar
            // to stay active until the user quits explicitly with Cmd + Q
            if (process.platform !== 'darwin') {
                app.quit();
            }
        })

        app.on('activate', () => {
            // On OS X it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (this.mainWindow === null) this.createWindow();
        })
    }


    createWindow() {
        var contextMenu = Menu.buildFromTemplate([
            { label: 'Show', click: () => {
                this.mainWindow.show();
            } },
            { label: 'Quit', click:  function(){
                app.isQuiting = true;
                app.quit();
            } }
        ]);

        this.tray = new Tray(path.join(__dirname, 'img', 'electron-systray.png'));
        this.tray.setToolTip(settings.name);
        this.tray.setContextMenu(contextMenu);

        this.tray.on('click', () => {
            if (!this.mainWindow) return;
            this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show()
        })

        let width = 370;
        let height = 495;

        // Create the browser window.
        this.mainWindow = new BrowserWindow({
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'img', 'electron-icon.png'),
            resizable: false,
            show: false,
            title: settings.name,
            height, width,
            'min-width': width,
            // 'min-height': 300,
        });

        this.mainWindow.webContents.toggleDevTools();

        ipcMain.on('resize-window', (event, data) => {
            if (!this.mainWindow) return;

            const currentSize = this.mainWindow.getContentSize();

            if (data.height !== currentSize[1]) {
                if (data.height > 600) data.height = 600;
                if (data.height < 100) data.height = 100;
                this.mainWindow.setSize(width, data.height, true);
            }
        });

        // and load the index.html of the app.
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true,
        }));

        this.mainWindow.on('ready-to-show', () => this.mainWindow && this.mainWindow.show());
        this.mainWindow.on('show', () => this.tray.setHighlightMode('always'));

        this.mainWindow.on('close', e => {
            if (!app.isQuiting) {
                e.preventDefault();
                this.mainWindow.hide();
            }
            return false;
        });

        // Emitted when the window is closed.
        this.mainWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.mainWindow = null;
        })
    }
}

global.app = new AppElectron();
