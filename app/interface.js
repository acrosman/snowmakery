/* global JSONFormatter */
/* global SnowfakeryEditor */

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
  if (document.editor) {
    document.editor.destroy();
    document.editor = null;
  }

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
    startval: data.recipe,
  };

  const editor = new SnowfakeryEditor(editorId, 'New Recipe', null, editorOptions);

  document.editor = editor;
}

// Basic editor initialization.
window.api.receive('initialize_editor', (data) => {
  editorInit(data, 'editor-holder', 'raw-data');
});

// When new files are loaded, re-initialize the editor.
window.api.receive('file_loaded', (data) => {
  editorInit(data, 'editor-holder', 'raw-data');
});
