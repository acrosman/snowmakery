/* global JSONFormatter */
/* global SnowfakeryEditor */
document.addEventListener('DOMContentLoaded', (event) => {
  window.api.send('interface_ready', {});
});

// Org Limits Response Handler.
window.api.receive('initialize_editor', (data) => {
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
  document.getElementById('raw-data').appendChild(formatter.render());

  // Enable the editor.
  const editor = new SnowfakeryEditor(
      document.getElementById('editor-wrapper'),
      'Sample',
      data.yaml,
  );

  editor.addUpdateCallback((newRecipe) => {
    document.getElementById('raw-data').innerHTML = '';
    const formatter = new JSONFormatter(newRecipe, 1, {
      hoverPreviewEnabled: true,
      hoverPreviewArrayCount: 100,
      hoverPreviewFieldCount: 5,
      animateOpen: true,
      animateClose: true,
      theme: 'dark',
      useToJSON: true,
    });
    document.getElementById('raw-data').appendChild(formatter.render());
  });
});
