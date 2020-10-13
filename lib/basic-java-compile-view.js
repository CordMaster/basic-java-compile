'use babel';

import $ from 'jquery';

export default class BasicJavaCompileView {

  constructor(serializedState) {
    // Create root element
    this.element = $(`
      <div class="basic-java-compile">
        <div class="buttons">
          <span>
            <span>Basic Java Compile: </span>
            <span class='status'>Idle</span>
          </span>
          <div class="btn-group">
            <div class="btn-status btn icon icon-playback-play"></div>
            <div class="btn-close btn icon icon-remove-close"></div>
          </div>
        </div>
        <div class="output">
          <textarea class="input-textarea" readonly></textarea>
        </div>
        <div class="input">
          <input type="text" class="input-text native-key-bindings" placeholder="> Command" />
        </div>
      </div>
    `);

    this.outputElement = this.element.find('textarea');
    this.inputElement = this.element.find('input[type="text"]');

    this.status = this.element.find('.status');
    this.statusBtnElement = this.element.find('.btn-status');
    this.closeElement = this.element.find('.btn-close');

    //always scroll to the bottom
    this.outputElement.change((e) => {
      this.scrollBottom();
    });
  }

  //scrollBottom handler
  scrollBottom() {
    this.outputElement.scrollTop(this.outputElement.prop('scrollHeight'));
  }

  //interaction methods
  log(str, newline = true) {
    //convert to string
    const fixedStr = str ? str : '';

    const convertedStr = typeof(fixedStr) === 'string' ? fixedStr : fixedStr.toString();
    console.log(fixedStr);
    const finalStr = newline ? convertedStr + '\n' : convertedStr;

    this.outputElement.val(this.outputElement.val() + finalStr);
    this.scrollBottom();
  }

  clear() {
    this.outputElement.val('');
  }

  //status appearance
  setModeRun() {
    this.status.text('Running...');

    this.statusBtnElement.removeClass('icon-playback-play');
    this.statusBtnElement.addClass('icon-primitive-square');

    this.inputElement.prop('disabled', false);
  }

  setModeStopped() {
    this.status.text('Idle');

    this.statusBtnElement.removeClass('icon-primitive-square');
    this.statusBtnElement.addClass('icon-playback-play');

    this.inputElement.prop('disabled', true);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

}
