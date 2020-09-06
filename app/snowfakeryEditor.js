/**
 * An interface to editor Snowfakery Data files.
 */
class SnowfakeryEditor {
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

    this.recipe = {
      plugins: [],
      include_files: [],
      options: [],
      macros: [],
      objects: [],
    };

    if (!this.isEnptyObject(existingRecipe)) {
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
   * Add a plugin to the Snow Plan
   * @param {*} existingPlugin a plugin object to add.
   */
  addPlugin(existingPlugin) {
    const newPlugin = {
      plugin: '',
    };
    if (!this.isEnptyObject(existingPlugin)) {
      // Append to the plugin collection.
      newPlugin.plugin = existingPlugin.plugin;
    }

    this.recipe.plugins.push(newPlugin);
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
   */
  renderObjectTemplate(template) {
    console.log('Render Object Template');
    this.dom.appendChild(this.generateObject('Object', template));
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
   * Renders a random JS object into the needed tree.
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
   */
  renderInclude(file) {
    console.log('Render Include File');
  }

  /**
   * Renders a specific macro into the dom.
   * @param {object} marco The marco to render.
   */
  renderMarco(marco) {
    console.log('Render Marco');
  }

  /**
   * Renders a specific option into the dom.
   * @param {object} option The option to render.
   */
  renderOption(option) {
    console.log('Render Option');
  }

  /**
   * Render a plugin element.
   * @param {object} plugin a plugin element for rendering.
   */
  renderPlugin(plugin) {
    console.log('Render Plugin');
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
    });

    this.dom.appendChild(newPlugin);
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

    this.dom.appendChild(this.generateSectionAddButton({label: 'Add Plugin'}));

    for (const file of this.recipe.include_files) {
      this.renderInclude(file);
    }

    this.dom.appendChild(this.generateSectionAddButton({label: 'Add Include'}));

    for (const macro of this.recipe.macros) {
      this.renderMacro(macro);
    }

    this.dom.appendChild(this.generateSectionAddButton({label: 'Add Macro'}));

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
   * Returns true with the value is null or undefined.
   * @param {*} value the value to test.
   * @return {boolean} empty status.
   */
  isEnptyObject(value) {
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
