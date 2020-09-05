/* global JSONFormatter */
/* global SnowfakeryEditor */
document.addEventListener('DOMContentLoaded', (event) => {
  window.api.send('sample_message', {
    message_content: 'Stuff and Things',
  });
});

// Org Limits Response Handler.
window.api.receive('sample_response', (data) => {
  alert(data.message);

  // Render the file content.
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

  const editor = new SnowfakeryEditor(
      data.yaml,
      document.getElementById('editor-wrapper'),
  );
  editor.renderAll();
});
