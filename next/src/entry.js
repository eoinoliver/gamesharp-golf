if (new URLSearchParams(location.search).get('lesson') === 'shot-lab') {
  import('./shot-lab.js');
} else if (new URLSearchParams(location.search).get('view') === 'library') {
  import('./main.js');
} else {
  import('./shotmaker.js');
}
