/* global JSONEditor */
/**
 * An interface to editor Snowfakery Data files that is a wrapper on JSON-Editor.
 */
class SnowfakeryEditor { // eslint-disable-line no-unused-vars
  /**
   * Constructor for a new editor.
   * @param {Element} domTarget The Dom element to connect to.
   * @param {String} recipeName the name of this Snowfakery recipe.
   * @param {Array} existingRecipe Snowfakery config, likely loaded from file.
   * @param {Object} editorConfig configuration for the editor passed to the underlying JSON Editor.
   */
  constructor(domTarget, recipeName, existingRecipe, editorConfig) {
    this.dom = domTarget;
    this.recipeName = recipeName;
    this.config = editorConfig;

    // Default Editor options.
    const defaultOptions = {
      disable_edit_json: true,
      display_required_only: true,
      keep_oneof_values: false,
      no_additional_properties: true,
      object_layout: 'grid',
    };

    // Merge defaults with provided settings.
    this.editorConfig = {
      ...defaultOptions,
      ...editorConfig,
    };

    // Default recipe structure for editing.
    this.recipe = {
      plugins: [],
      include_files: [],
      options: [],
      macros: [],
      objects: [],
    };

    // If an existing recipe was provided merge with default structure.
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

    this._setupEditor(domTarget);
  }

  /**
   * @param {string} domTargetId the id to use for the editor.
   */
  _setupEditor(domTargetId) {
    const ACCOUNT_FIELDS = {
      Name: {
        $ref: '#/definitions/name',
      },
      BillingStreet: this._makeFieldDefinition('street'),
      BillingCity: this._makeFieldDefinition('city'),
      BillingCountry: this._makeFieldDefinition('country'),
      BillingPostCode: this._makeFieldDefinition('post_code'),

      PrimaryContact: {
        $ref: '#/definitions/contact',
      },
    };

    const CONTACT_FIELDS = {
      FirstName: this._makeFieldDefinition('first_name'),
      LastName: this._makeFieldDefinition('last_names'),
      AccountId: {
        $ref: '#/definitions/account',
      },
    };

    const SMALL_INPUT = {type: 'string', options: {input_width: '100px', grid_columns: 1}};

    const MACRO = {
      type: 'object',
      title: 'macro',
      format: 'grid',
      properties: {
        name: SMALL_INPUT,
        fields:
            {type: 'object', additionalProperties: true},
      },
      defaultProperties: ['name', 'fields'],
    };

    const PLUGINS = {
      type: 'array',
      items: {type: 'string'},
      title: 'plugins',
      required: true,
      options: {disable_properties: true, disable_collapse: true},
    };

    const OBJECTS = {
      'type': 'array',
      'items': {
        'anyOf': [
          {title: '...', format: 'hidden', type: 'string'},
          {
            $ref: '#/definitions/account',
          },
          {
            $ref: '#/definitions/contact',
          },
        ],
      },
      'required': true,
      'options': {disable_properties: true, disable_collapse: true},
    };

    const docSchema = {
      'type': 'object',
      'title': 'Recipe',
      'options': {disable_properties: true, disable_collapse: true},
      'properties': {
        objects: OBJECTS,
        macros: {
          type: 'array', items: {type: MACRO}, title: 'macros', required: true,
          options: {disable_properties: true, disable_collapse: true},
        },
        plugins: PLUGINS,
        include_files: {
          type: 'array', items: {type: 'string'}, title: 'included files', required: true,
          options: {disable_properties: true, disable_collapse: true},
        },
      },
      'format': 'categories',
      'definitions': {
        'name': this._makeFieldDefinition('company'),
        'account': this._makeObjectDefinition('Account', ACCOUNT_FIELDS, ['Name']),
        'contact': this._makeObjectDefinition('Contact', CONTACT_FIELDS, ['FirstName', 'LastName']),
      },
    };

    const editor = new JSONEditor(document.getElementById(domTargetId), {
      schema: docSchema,
      ...this.config});

    // Hook up the submit button to log to the console
    document.getElementById('submit').addEventListener('click', function() {
    // Get the value from the editor
      console.log(editor.getValue());
    });

    this.editor = editor;
  }

  /**
   * Helper function to build out fields.
   * @param {*} defaultFake
   * @return {object}
   */
  _makeFieldDefinition(defaultFake) {
    return {
      'oneOf': [
        {
          type: 'string',
          options: {grid_columns: 1, input_width: '300px'},
        },
        {
          type: 'object', title: 'fake',
          options: {disable_properties: true, disable_collapse: true},
          properties:
                {
                  type: {
                    type: 'string', required: true,
                    enum: [
                      'first_name',
                      'last_name',
                      'street',
                      'city',
                      'country',
                      'post_code',
                      'company',
                    ],
                    default: defaultFake,
                    format: 'select2',
                    options: {
                      select2: {
                        width: '200px',
                      },
                    },
                  },
                },
        },
        {
          type: 'object', title: 'formula',
          properties:
                {
                  formula: {
                    type: 'string', required: true,
                    options: {
                      grid_columns: 1,
                      input_width: '300px',
                      disable_properties: true,
                      disable_collapse: true,
                    },
                  },
                },
          options: {disable_properties: true, disable_collapse: true},
        },
      ],
    };
  }

  /**
   * Helper function to make it easier to build out objects.
   * @param {*} name
   * @param {*} fields
   * @param {*} defaultFields
   * @return {*}
   */
  _makeObjectDefinition(name, fields, defaultFields) {
    const COMMON_PROPS = {
      count: {
        type: 'integer',
        default: 1,
        options: {grid_columns: 1},
      },
    };

    return {
      type: 'object',
      title: name,
      defaultProperties: ['object', 'count', 'fields'],
      properties: {
        object: {
          type: 'string',
          template: name,
          required: true,
          options: {input_width: '100px', grid_columns: 1, hidden: true},
        },
        ...COMMON_PROPS,
        fields: {
          type: 'object',
          defaultProperties: defaultFields,
          properties: fields,
          format: 'grid-strict',
          options: {class: 'foo'},
        },
      },
      format: 'grid',
    };
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
   * Destroy's the existing editor.
   */
  destroy() {
    this.editor.destroy();
    this.dom = null;
    this.recipeName = null;
    this.config = null;
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
