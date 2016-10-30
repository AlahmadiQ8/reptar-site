var prism = require('./prism');

// -----------------------------------------------------
// close message
var btns = document.querySelectorAll(".js-close");
if (btns) {
  btns.forEach(function(btn){
    btn.addEventListener('click', function() {
      this.parentNode.parentNode.remove();
    });
  })
}