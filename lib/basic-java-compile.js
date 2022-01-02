'use babel';

import $ from 'jquery';

import BasicJavaCompileView from './basic-java-compile-view';
import { CompositeDisposable } from 'atom';

import CompileHandler from './compile-handler.js';

export default {

  config: {
    debug: {
      type: 'boolean',
      default: false
    },

    javaHome: {
      type: 'string',
      default: process.env.JAVA_HOME ? process.env.JAVA_HOME : 'Not set'
    },

    javacArgs: {
      type: 'string',
      default: ''
    },

    javaArgs: {
      type: 'string',
      default: ''
    },

    font: {
      type: 'string',
      default: 'Liberation Mono'
    },

    textSize: {
      type: 'integer',
      default: '13'
    },

    panelHeight: {
      type: 'integer',
      default: '350'
    }
  },

  mainView: null,
  mainPane: null,
  subscriptions: null,

  activate(state) {
    this.mainView = new BasicJavaCompileView(state.mainView);
    this.mainPane = atom.workspace.addBottomPanel({
      item: this.mainView.element,
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register commands
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'basic-java-compile:run': () => {
        this.run();
        return true;
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'basic-java-compile:run-file': () => {
        this.run(true);
        return true;
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'basic-java-compile:show': () => {
        this.show();
        return true;
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'basic-java-compile:stop': () => {
        this.stop();
        return true;
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'basic-java-compile:hide': () => {
        this.hide();
        return true;
      }
    }));

    //bind message pane events
    this.mainView.statusBtnElement.click((e) => {
      if(CompileHandler.isRunning()) this.stop();
      else this.run();
    });

    this.mainView.closeElement.click((e) => {
      this.hide();
    });

    this.mainView.inputElement.keydown((e) => {
      //on enter press
      if(e.which === 13) {
        //write to stdin
        const element = $(e.target);
        CompileHandler.write(element.val());
        element.val('');
      }
    });

    //apply config styles
    atom.config.observe('basic-java-compile.font', (newValue) => {
      this.mainView.element.css('font-family', newValue);
    });

    atom.config.observe('basic-java-compile.textSize', (newValue) => {
      this.mainView.element.css('font-size', newValue);
    });

    atom.config.observe('basic-java-compile.panelHeight', (newValue) => {
      this.mainView.element.css('height', newValue);

      //todo: reflow fix?
    });
  },

  deactivate() {
    this.mainPane.destroy();
    this.subscriptions.dispose();
    this.mainView.destroy();

    CompileHandler.stop();
  },

  serialize() {
    return {
      mainView: this.mainView.serialize()
    };
  },

  async run(fileOnly = false) {
    const debug = atom.config.get('basic-java-compile.debug');

    //stop old projects
    //TODO: FIX WEIRD BUG
    this.stop();

    //clear
    this.mainView.clear();

    this.mainPane.show();

    this.mainView.log('Starting build...');
    this.mainView.log();

    const editor = atom.workspace.getActiveTextEditor();

    editor.save();

    const fullPath = editor.getPath();
    const fullName = editor.getTitle();

    const name = fullName.replace(/\..*/g, '');
    const ext = '.' + fullName.replace(/.*\./g, '');
    const workingDir = fullPath.replace(fullName, '');

    if(debug) {
      this.mainView.log(`File name: ${name}`);
      this.mainView.log(`File extension: ${ext}`);
      this.mainView.log(`Working directory: ${workingDir}`);
      this.mainView.log();
    }

    if(ext === '.java') {
      //env check
      //try to use config; else use env
      const javaPath = atom.config.get('basic-java-compile.javaHome');
      const javacArgs = atom.config.get('basic-java-compile.javacArgs');
      const javaArgs = atom.config.get('basic-java-compile.javaArgs');
      const splitJavacArgs = javacArgs == "" ? [] : javacArgs.split(' ');
      const splitJavaArgs = javaArgs == "" ? [] : javaArgs.split(' ');

      if(javaPath !== "Not set") {
        this.mainView.log(`Java path: ${javaPath}`);
        this.mainView.log(`Javac args: ${javacArgs}`);
        this.mainView.log();

        this.mainView.setModeRun();
        //start compile
        await CompileHandler.start(javaPath, splitJavacArgs, splitJavaArgs, workingDir, name, ext, this.mainView, fileOnly);

        this.mainView.setModeStopped();

        this.mainView.log('Done.');
      } else {
        this.mainView.log('Error: missing java path');
      }
    } else {
      this.mainView.log('Error: not a java file');
    }
  },

  stop() {
    this.mainView.setModeStopped();

    CompileHandler.stop();
  },

  show() {
    this.mainPane.show();
  },

  hide() {
    this.stop();

    this.mainPane.hide();
  }
};
