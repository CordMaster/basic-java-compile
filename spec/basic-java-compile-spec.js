'use babel';

import BasicJavaCompile from '../lib/basic-java-compile';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('BasicJavaCompile', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('basic-java-compile');
  });

  describe('when the basic-java-compile:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.basic-java-compile')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'basic-java-compile:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.basic-java-compile')).toExist();

        let basicJavaCompileElement = workspaceElement.querySelector('.basic-java-compile');
        expect(basicJavaCompileElement).toExist();

        let basicJavaCompilePanel = atom.workspace.panelForItem(basicJavaCompileElement);
        expect(basicJavaCompilePanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'basic-java-compile:toggle');
        expect(basicJavaCompilePanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.basic-java-compile')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'basic-java-compile:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let basicJavaCompileElement = workspaceElement.querySelector('.basic-java-compile');
        expect(basicJavaCompileElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'basic-java-compile:toggle');
        expect(basicJavaCompileElement).not.toBeVisible();
      });
    });
  });
});
