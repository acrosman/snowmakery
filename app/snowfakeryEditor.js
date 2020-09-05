/**
 * An interface to editor Snowfakery Data files.
 */
class SnowfakeryEditor {
  /**
   * Constructor for a new editor.
   * @param {Array} existingDataStructure Snowfakery config, likely loaded
   *  from file.
   * @param {Element} domTarget The Dom element to connect to.
   */
  constructor(existingDataStructure, domTarget) {
    this.data = existingDataStructure;
    this.dom = domTarget;
    this.elementCounter = 0;
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
   * Renders a specific element from a Snowfakery file. This function
   * determines the element type and forwards it on for final rendering.
   * @param {Object} element The element to render.
   */
  renderElement(element) {
    const elementTypes = [
      'object',
      'plugin',
    ];

    let foundEngine = '';
    for (const key of elementTypes) {
      if (Object.prototype.hasOwnProperty.call(element, key)) {
        foundEngine = key;
        break;
      }
    }

    switch (foundEngine) {
      case 'plugin':
        this.renderPlugin(element);
        break;
      case 'object':
        this.renderObjectTemplate(element);
        break;
      default:
        console.log('missing renderer');
    }
  }
  /**
   * Renders the current data into the dom, replacing anything already there.
   */
  renderAll() {
    // Wipe existing elements.
    this.dom.innerHTML = '';
    this.elementCounter = 0;

    // Loop over the main elements and send each off for appropreiate rendering.
    // Order matters here, so we need to run carefully.
    for (const statement of this.data) {
      this.renderElement(statement);
    }
  }

  /**
   * Checks if a value is an object.
   * @param {*} value value to test.
   * @return {boolean}
   */
  isObject (value) {
    return value && typeof value === 'object' && value.constructor === Object;
  }
}
