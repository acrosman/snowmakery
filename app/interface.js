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
  // Render any provided default data.
  const formatter = new JSONFormatter(data.yaml, 1, {
    hoverPreviewEnabled: true,
    hoverPreviewArrayCount: 100,
    hoverPreviewFieldCount: 5,
    animateOpen: true,
    animateClose: true,
    theme: 'dark',
    useToJSON: true,
  });
  document.getElementById(jsonId).appendChild(formatter.render());

  // Enable the editor.
  const editor = new SnowfakeryEditor(
      document.getElementById(editorId),
      data.file,
      data.recipe,
  );

  editor.addUpdateCallback((newRecipe) => {
    document.getElementById(jsonId).innerHTML = '';
    const formatter = new JSONFormatter(newRecipe, 1, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
      animateOpen: true,
      animateClose: true,
      theme: 'dark',
      useToJSON: true,
    });
    document.getElementById(jsonId).appendChild(formatter.render());
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
