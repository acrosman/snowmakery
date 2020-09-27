/**
 * An interface to editor Snowfakery Data files.
 */
class SnowfakeryEditor { // eslint-disable-line no-unused-vars
  /**
   * Constructor for a new editor.
   * @param {Element} domTarget The Dom element to connect to.
   * @param {String} recipeName the name of this Snowfakery recipe.
   * @param {Array} existingRecipe Snowfakery config, likely loaded from file.
   */
  constructor(domTarget, recipeName, existingRecipe) {
    this.dom = domTarget;
    this.elementCounter = 0;
    this.recipeName = recipeName;
    this.updateCallbacks = [];

    this.recipe = {
      plugins: [],
      include_files: [],
      options: [],
      macros: [],
      objects: [],
    };

    if (!this.isEmptyObject(existingRecipe)) {
      for (const element of existingRecipe) {
        if (Object.prototype.hasOwnProperty.call(element, 'plugin')) {
          this.recipe.plugins.push(element);
        } else if (Object.prototype.hasOwnProperty.call(element, 'include_file')) {
          this.recipe.include_files.push(element);
        } else if (Object.prototype.hasOwnProperty.call(element, 'macro')) {
          this.recipe.macros.push(element);
        } else if (Object.prototype.hasOwnProperty.call(element, 'option')) {
          this.recipe.options.push(element);
        } else if (Object.prototype.hasOwnProperty.call(element, 'object')) {
          this.recipe.objects.push(element);
        }
      }
    }

    this.renderAll();
  }

  /**
   * Add an update callback function.
   * @param {function} callback the function to call when there are updates to the recipe.
   */
  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  /**
   * Returns an object ready to convert into final YAML for Snowfakery.
   * @return {object} the current recipe restructured for use.
   */
  getRecipe() {
    const data = [];

    for (const plug of this.recipe.plugins) {
      data.push(plug);
    }
    for (const file of this.recipe.include_files) {
      data.push(file);
    }
    for (const option of this.recipe.options) {
      data.push(option);
    }
    for (const macro of this.recipe.macros) {
      data.push(macro);
    }
    for (const obj of this.recipe.objects) {
      data.push(obj);
    }

    return data;
  }

  /**
   * Call all callbacks when there is a new update.
   */
  handleUpdateCallbacks() {
    for (const callback of this.updateCallbacks) {
      callback(this.getRecipe());
    }
  }

  /**
   * Add a plugin to the recipe.
   * @param {*} existingPlugin a plugin object to add.
   */
  addPlugin(existingPlugin) {
    const newPlugin = {
      plugin: '',
    };
    if (!this.isEmptyObject(existingPlugin) && this.isset(existingPlugin.plugin)) {
      // Append to the plugin collection.
      newPlugin.plugin = existingPlugin.plugin;
    }

    this.recipe.plugins.push(newPlugin);
    this.handleUpdateCallbacks();
    this.renderAll();
  }

  /**
   * Add an include to the recipe.
   * @param {*} existingInclude an include_file object to add.
   */
  addIncludeFile(existingInclude) {
    const newInclude = {
      include_file: '',
    };
    if (!this.isEmptyObject(existingInclude) && this.isset(existingInclude.include_file)) {
      // Append to the plugin collection.
      newInclude.include_file = existingInclude.include_file;
    }

    this.recipe.include_files.push(newInclude);
    this.handleUpdateCallbacks();
    this.renderAll();
  }

  /**
   * Add a macro to the recipe.
   * @param {*} existingMacro a macro object to add.
   */
  addMacro(existingMacro) {
    const newMacro = {
      macro: '',
    };
    if (!this.isEmptyObject(existingMacro) && this.isset(existingMacro.macro)) {
      // Append to the plugin collection.
      newMacro.macro = existingMacro.macro;
    }

    this.recipe.macros.push(newMacro);
    this.handleUpdateCallbacks();
    this.renderAll();
  }

  /**
   * Generate and return set of dom elements for a form element, wrapped in a
   *  div.
   * @param {object} settings the settings to use for this new element.
   * @return {Element} new Dom Element generated.
   */
  generateLabeledInput(settings) {
    // Generate elements
    const newWrapper = document.createElement('div');
    const newLabel = document.createElement('label');
    const newInput = document.createElement('input');
    const labelText = document.createTextNode(settings.label);

    // Set Attributes.
    newWrapper.setAttribute('class', settings.classes.wrapper.join(' '));
    newLabel.setAttribute('for', settings.elementId);
    newInput.setAttribute('id', settings.elementId);
    newInput.setAttribute('class', settings.classes.inner.join(' '));
    newInput.setAttribute('type', settings.inputType);
    newInput.setAttribute('value', settings.value);

    // Set callbacks on input
    if (!this.isEmptyObject(settings.events)) {
      for (const [key, value] of Object.entries(settings.events)) {
        newInput.addEventListener(key, value);
      }
    }

    // Assemble.
    newLabel.appendChild(labelText);
    newWrapper.appendChild(newLabel);
    newWrapper.appendChild(newInput);

    // Return
    return newWrapper;
  }

  /**
   * Helper to make it easy to create simple spans, labels, headers, p, etc.
   * @param {string} text the text to wrap.
   * @param {string} wrapperTag the tag to wrap the text in.
   * @param {object} wrapperAttributes name value pairs for attributes.
   * @return {Element} the generated elements.
   */
  generateWrappedText(text, wrapperTag, wrapperAttributes) {
    // Generate the elements.
    const newWrapper = document.createElement(wrapperTag);
    const textNode = document.createTextNode(text);

    // Add attributes.
    for (const [key, value] of Object.entries(wrapperAttributes)) {
      newWrapper.setAttribute(key, value);
    }

    // Assemble and send.
    newWrapper.appendChild(textNode);
    return newWrapper;
  }

  /**
   * Render an object template
   * @param {object} template the object template to render.
   * @param {Element} domTarget the spot in the dom to render the Object.
   */
  renderObjectTemplate(template, domTarget) {
    console.log('Render Object Template');
    if (!this.isset(domTarget)) {
      domTarget = this.dom;
    }
    domTarget.appendChild(this.generateObject('Object', template));
  }

  /**
   * Wraps an array and generates DOM for sub-elements.
   * @param {string} label, the section label.
   * @param {Array} element the array element.
   * @return {Element} the generated elements.
   */
  generateArray(label, element) {
    const arrayDiv = document.createElement('div');
    for (const el of element) {
      arrayDiv.appendChild(this.generateObject(label, el));
    }

    return arrayDiv;
  }

  /**
   * Renders a random JS object into the tree.
   * @param {string} label section label.
   * @param {*} element the element in the tree to render.
   * @return {Element} Dom element generated.
   */
  generateObject(label, element) {
    const objectDiv = document.createElement('div');
    const labelNode = this.generateWrappedText(
        label,
        'span',
        {class: 'badge badge-info'},
    );
    objectDiv.setAttribute('class', 'object-wrapper');
    objectDiv.appendChild(labelNode);

    let row;
    for (const [key, value] of Object.entries(element)) {
      if (Array.isArray(value) && value !== null) {
        objectDiv.appendChild(this.generateArray(key, value));
      }
      if (this.isObject(value) && value !== null) {
        objectDiv.appendChild(this.generateObject(key, value));
      } else {
        row = this.generateLabeledInput({
          label: `${key}: `,
          elementId: `sm-${key}-${this.elementCounter}`,
          inputType: 'text',
          value: value,
          classes: {
            wrapper: [],
            inner: [],
          },
        });
        objectDiv.appendChild(row);
      }
    }
    return objectDiv;
  }

  /**
   * Renders a specific include file into the dom.
   * @param {object} file The file reference to render.
   * @param {Element} domTarget the spot in the dom to render the include.
   */
  renderInclude(file, domTarget) {
    console.log('Render Include File');
    if (!this.isset(domTarget)) {
      domTarget = this.dom;
    }
    this.elementCounter++;
    const newInclude = this.generateLabeledInput({
      label: 'Include_File: ',
      elementId: `sm-include-${this.elementCounter}`,
      inputType: 'text',
      value: file.include_file,
      classes: {
        wrapper: [],
        inner: [],
      },
      events: {
        'blur': (event) => {
          file.include_file = event.target.value;
        },
      },
    });

    domTarget.appendChild(newInclude);
  }

  /**
   * Renders a specific macro into the dom.
   * @param {object} macro The macro to render.
   * @param {Element} domTarget the spot in the dom to render the macro.
   */
  renderMarco(macro, domTarget) {
    console.log('Render Marco');
    if (!this.isset(domTarget)) {
      domTarget = this.dom;
    }

    // TODO: Work out a responable way to handle these. Free Text?
    if (this.isEmptyObject(macro)) {
      alert('Sorry adding macros is not yet supported.');
      return;
    }

    const newMacro = this.generateObject('Macro', macro);
    domTarget.appendChild(newMacro);
  }

  /**
   * Renders a specific option into the dom.
   * @param {object} option The option to render.
   * @param {Element} domTarget the spot in the dom to render the macro.
   */
  renderOption(option, domTarget) {
    console.log('Render Option');
    if (!this.isset(domTarget)) {
      domTarget = this.dom;
    }
  }

  /**
   * Render a plugin element.
   * @param {object} plugin a plugin element for rendering.
   * @param {Element} domTarget the spot in the dom to render the plugin.
   */
  renderPlugin(plugin, domTarget) {
    console.log('Render Plugin');
    if (!this.isset(domTarget)) {
      domTarget = this.dom;
    }
    this.elementCounter++;
    const newPlugin = this.generateLabeledInput({
      label: 'Plugin: ',
      elementId: `sm-plugin-${this.elementCounter}`,
      inputType: 'text',
      value: plugin.plugin,
      classes: {
        wrapper: [],
        inner: [],
      },
      events: {
        'blur': (event) => {
          plugin.plugin = event.target.value;
        },
      },
    });

    domTarget.appendChild(newPlugin);
  }

  /**
   * Generage a button to add a new section.
   * @param {object} settings button settings.
   * @return {Element} returns the new dom element.
   */
  generateSectionAddButton(settings) {
    const buttonWrapper = document.createElement('div');
    const button = document.createElement('button');
    const label = this.generateWrappedText(
        settings.label,
        'span',
        {class: 'glyphicon glyphicon-plus-sign'},
    );

    button.setAttribute('type', 'button');
    button.setAttribute('class', 'btn btn-default btn-sm');

    button.appendChild(label);
    buttonWrapper.appendChild(button);

    if (!this.isEmptyObject(settings.clickHandler)) {
      button.addEventListener('click', settings.clickHandler);
    }

    return buttonWrapper;
  }

  /**
   * Renders the current data into the dom, replacing anything already there.
   */
  renderAll() {
    // Wipe existing elements.
    this.dom.innerHTML = '';
    this.elementCounter = 0;

    for (const plugin of this.recipe.plugins) {
      this.renderPlugin(plugin);
    }

    this.dom.appendChild(this.generateSectionAddButton({
      label: 'Add Plugin',
      clickHandler: () => {
        this.addPlugin();
      },
    }));

    for (const file of this.recipe.include_files) {
      this.renderInclude(file);
    }

    this.dom.appendChild(this.generateSectionAddButton({
      label: 'Add Include',
      clickHandler: () => {
        this.addIncludeFile();
      },
    }));

    for (const macro of this.recipe.macros) {
      this.renderMacro(macro);
    }

    this.dom.appendChild(this.generateSectionAddButton({
      label: 'Add Macro',
      clickHandler: () => {
        this.addMacro();
      },
    }));

    for (const opt of this.recipe.options) {
      this.renderOption(opt);
    }

    this.dom.appendChild(this.generateSectionAddButton({label: 'Add Option'}));

    for (const obj of this.recipe.objects) {
      this.renderObjectTemplate(obj);
    }

    this.dom.appendChild(this.generateSectionAddButton({label: 'Add Object'}));
  }

  // =================== General JS Helpers ======================
  /**
   * Checks if a value is an object.
   * @param {*} value value to test.
   * @return {boolean}
   */
  isObject(value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }

  /**
   * Returns turn when the argument is a valid object. Derived from: https://locutus.io/php/isset/
   * @return {boolean} true when the tested value is set.
   */
  isset(...args) {
    const l = args.length;
    let i = 0;
    let undef;

    if (l === 0) {
      throw new Error('Empty call to editor isset');
    }

    while (i !== l) {
      if (args[i] === undef || args[i] === null) {
        return false;
      }
      i++;
    }

    return true;
  }

  /**
   * Returns true with the value is null or undefined.
   * @param {*} value the value to test.
   * @return {boolean} empty status.
   */
  isEmptyObject(value) {
    return this.isNull(value) || this.isUndefined(value);
  }

  /**
   * Returns if a value is null.
   * @param {*} value value to test.
   * @return {boolean} result of test.
   */
  isNull(value) {
    return value === null;
  }

  /**
   * Returns if a value is undefined
   * @param {*} value value to test.
   * @return {boolean} result of test.
   */
  isUndefined(value) {
    return typeof value === 'undefined';
  }
}
