if (new URLSearchParams(location.search).get('lesson') === 'shot-lab') {
  import('./shot-lab.js');
} else {
  import('./main.js');
}
