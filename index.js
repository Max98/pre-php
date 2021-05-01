#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const glob = require("glob");
const chalk = require('chalk');

var watch = require('node-watch');

var myArgs = process.argv;

const PATH = process.cwd();

let phpFiles = [];

const configData = {
    defs: [],
    ignoreDir: ["build"],
    ignoreProcess: [],
    buildPath: "./build"
};

function main() {
    if (!fs.existsSync(PATH + "/pphp.json")) {
        console.error('config file not found, aborting.');
        return;
    }

    console.info('')

    const configFile = JSON.parse(fs.readFileSync(PATH + "/pphp.json", 'utf8'));

    if(configFile.defs)
        configData.defs = configFile.defs;
    
    if(configFile.ignoreDir)
        configData.ignoreDir = configData.ignoreDir.concat(configFile.ignoreDir);
    
    if(configFile.ignoreProcess)
        configData.ignoreProcess = configFile.ignoreProcess;
    
    if(configFile.buildPath)
        configData.buildPath = configFile.buildPath;

    console.info(chalk.yellowBright('Ignored directories:'));
    console.info(configData.ignoreDir);

    console.info(chalk.yellowBright('Ignored directories for processing:'));
    console.info(configData.ignoreProcess);

    console.info(chalk.yellowBright('Defs:'));
    console.info(configData.defs);

    console.info(chalk.yellowBright('Building into: ') + '"' + configData.buildPath + '"');

    console.info('')

    if (fs.existsSync(configData.buildPath)) {
        if (myArgs.includes('-f')) {
            console.log(chalk.redBright('Building fresh!'));
            fse.emptyDirSync(configData.buildPath);
        } 
    }
    else
        fs.mkdirSync(configData.buildPath);
    
    try {
        const files = fs.readdirSync(PATH);

        files.forEach(file =>  {
            if (configData.ignoreDir.includes(file)) return;

            if (file == "pphp.json") {
                return;
            }

            copy(file);
        });

        processData();

    } catch (error) {
         return console.log('Unable to scan directory: ' + error);
    }

    if (myArgs.includes('-w')) {
        console.log(chalk.yellowBright('Watching for changes....'))
        watch(PATH, { recursive: true, filter: /\.php$/ }, function (evt, filePath) {
            const fileName = path.basename(filePath);
            if (evt == "update") {
                //TODO: no
                if (filePath.includes('build')) return;

                copy(filePath.replace(process.cwd(), "." + path.sep));
                processFile(configData.buildPath + path.sep + filePath.replace(process.cwd(), ""));
            }
        });
    }
}


function copy(pathData) {
    // To copy a folder or file  
    fse.copySync(PATH + "/" + pathData, configData.buildPath + path.sep + pathData, { overwrite: true }, (err) => {
        if (err) {                 
            console.error(err);   
        } else {
            console.log("success!");
        }
    });
}

function processData() {
    phpFiles = glob.sync(configData.buildPath + '/**/*.php');

    phpFiles.forEach(ph => {
        if (configData.ignoreProcess.some(r => ph.split('/').includes(r))) return;
    
        processFile(ph);
    })

    console.info(chalk.yellowBright('Done'));
}

function processFile(file) {
    console.info(chalk.green('Processing file: ') + file);

    let fileData = fs.readFileSync(file, 'utf8');

    let linesArray = fileData.split("\n");

    let processData = [];

    let output = "";

    let startLine = 0;
    let endLine = 0;
    let elseLine = null;
    let ndef = false;

    for (let i = 0; i < linesArray.length; i++) {
        const line = linesArray[i];
        if (line.trim().startsWith('#')) {
            const stat = line.trim().split(' ');
            switch (stat[0]) {
                case "#ifdef":
                    startLine = i;
                    break;
                
                case "#ifndef":
                    ndef = true;
                    startLine = i;
                    break;
                
                
                case "#else":
                    elseLine = i;
                    break;
                
                case "#endif":
                    endLine = i;
                    processData.push({ startLine, endLine, elseLine, ndef });
                    startLine = 0;
                    endLine = 0;
                    ndef = false;
                    break;
                
                default:
                    break;
            }
        }
    }

    processData.slice().reverse().forEach(pd => {
        if (!pd.elseLine)
        {
            if (configData.defs.includes(linesArray[pd.startLine].trim().split(' ')[1]) == pd.ndef) {
                linesArray.splice(pd.startLine, pd.endLine - pd.startLine + 1);
            } else {
                linesArray.splice(pd.endLine, 1);
                linesArray.splice(pd.startLine, 1);
            }
        } else {
            if (configData.defs.includes(linesArray[pd.startLine].trim().split(' ')[1]) == pd.ndef) {
                linesArray.splice(pd.endLine, 1);
                linesArray.splice(pd.startLine, pd.elseLine - pd.startLine + 1);
            } else {
                linesArray.splice(pd.elseLine, pd.endLine - pd.elseLine + 1);
                linesArray.splice(pd.startLine, 1);
            }
        }
    })

    output = linesArray.join('\n');

    fs.writeFileSync(file, output);

}


main();