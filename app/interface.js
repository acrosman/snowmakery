/* global JSONFormatter */
/* global JSONEditor */

document.addEventListener('DOMContentLoaded', (event) => {
  window.api.send('interface_ready', {});
});

// Setup select file handler.
document.getElementById('sm-btn-load-config').addEventListener('click', () => {
  window.api.send('load_file', {});
}, false);

// Setup select file handler.
document.getElementById('sm-btn-save-config').addEventListener('click', () => {
  window.api.send('save_file', {
    recipe: document.editor.getRecipe(),
  });
}, false);

/**
 *
 * @param {*} data
 * @param {*} editorId
 * @param {*} jsonId
 */
function editorInit(data, editorId, jsonId) {
  if (data.recipe !== null) {
    // Render any provided default data.
    const formatter = new JSONFormatter(data.recipe, 1, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
      animateOpen: true,
      animateClose: true,
      theme: 'dark',
      useToJSON: true,
    });
    document.getElementById(jsonId).appendChild(formatter.render());
  }

  const editorOptions = {
    theme: 'bootstrap4',
    iconlib: 'fontawesome5',
    disable_edit_json: true,
    display_required_only: true,
    // show_errors: "never",
    keep_oneof_values: false,
    no_additional_properties: true,
    input_width: '100px',
    object_layout: 'grid',
  };

  /**
   * Helper function to build out fields.
   * @param {*} defaultFake
   * @return {object}
   */
  function makeFieldDefinition(defaultFake) {
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

  const COMMON_PROPS = {
    count: {
      type: 'integer',
      default: 1,
      options: {grid_columns: 1},
    },
  };


  const ACCOUNT_FIELDS = {
    Name: {
      $ref: '#/definitions/name',
    },
    BillingStreet: makeFieldDefinition('street'),
    BillingCity: makeFieldDefinition('city'),
    BillingCountry: makeFieldDefinition('country'),
    BillingPostCode: makeFieldDefinition('post_code'),

    PrimaryContact: {
      $ref: '#/definitions/contact',
    },
  };

  const CONTACT_FIELDS = {
    FirstName: makeFieldDefinition('first_name'),
    LastName: makeFieldDefinition('last_names'),
    AccountId: {
      $ref: '#/definitions/account',
    },
  };

  /**
   *
   * @param {*} name
   * @param {*} fields
   * @param {*} defaultFields
   * @return {*}
   */
  function makeObjectDefinition(name, fields, defaultFields) {
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
      'name': makeFieldDefinition('company'),
      'account': makeObjectDefinition('Account', ACCOUNT_FIELDS, ['Name']),
      'contact': makeObjectDefinition('Contact', CONTACT_FIELDS, ['FirstName', 'LastName']),
    },
  };

  const editor = new JSONEditor(document.getElementById('editor_holder'), {
    schema: docSchema,
    ...editorOptions});

  // Hook up the submit button to log to the console
  document.getElementById('submit').addEventListener('click', function() {
    // Get the value from the editor
    console.log(editor.getValue());
  });

  document.editor = editor;
}

// Basic editor initialization.
window.api.receive('initialize_editor', (data) => {
  editorInit(data, 'editor-wrapper', 'raw-data');
});

// When new files are loaded, re-initialize the editor.
window.api.receive('file_loaded', (data) => {
  editorInit(data, 'editor-wrapper', 'raw-data');
});
