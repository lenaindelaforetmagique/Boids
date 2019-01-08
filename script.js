let u_ = new Universe(window.innerWidth, window.innerHeight);

var updateCB = function(timestamp) {
  u_.refresh(timestamp);
  window.requestAnimationFrame(updateCB);
};
updateCB(0);