'use babel';

import { spawn } from 'child_process';

function spawnToPromise(proc) {
  return new Promise((resolve, reject) => {
    proc.on('close', (code) => {
      if(code === 0) resolve(code);
      else reject(code);
    });
  });
}

export default {
  output: null,

  compileProc: null,
  execProc: null,

  //params: javaPath, javacArgs, javaArgs, workingDir, filename, ext, output: called to log and clear output
  async start(javaPath, javacArgs, javaArgs, workingDir, filename, ext, output, fileOnly) {
    this.output = output;

    const fullName = filename + ext;
    const runFilename = fileOnly ? fullName : filename;

    try {
      // Only compile if we are using a project
      if(!fileOnly) {
        this.output.log('Running javac...');
        this.output.log();

        this.compileProc = spawn(javaPath + '/bin/' + 'javac', [...javacArgs, fullName], { cwd: workingDir });

        this.compileProc.stdout.on('data', (data) => {
          this.output.log(data, false);
        });

        this.compileProc.stderr.on('data', (data) => {
          this.output.log(data, false);
        });

        await spawnToPromise(this.compileProc);
        this.compileProc = null;
      }
      
      this.output.log('Running java...');
      this.output.log();

      this.execProc = spawn(javaPath + '/bin/' + 'java', [...javaArgs, runFilename], { cwd: workingDir });

      this.execProc.stdout.on('data', (data) => {
        this.output.log(data, false);
      });

      this.execProc.stderr.on('data', (data) => {
        this.output.log(data, false);
      });

      try {
        await spawnToPromise(this.execProc);
        this.execProc = null;
      } catch(e) {
        this.output.log(`java exited with code: ${e}`);

        this.execProc = null;
      }
      this.output.log();
    } catch(e) {
      this.output.log(`javac exited with code: ${e}`);

      this.compileProc = null;
    }

    this.output = null;
  },

  //handles writes to the function
  write(str) {
    if(this.execProc) {
      this.output.log(str);
      this.execProc.stdin.write(str + '\n');
    }
  },

  stop() {
    if(this.compileProc) {
      this.compileProc.kill();
      this.compileProc = null;
    }

    if(this.execProc) {
      this.execProc.kill();
      this.compileProc = null;
    }

    if(this.output) this.output = null;
  },

  isRunning() {
    return this.compileProc || this.execProc;
  }
}
