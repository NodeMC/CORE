var key = getApiKey();

$("#restart").click(function() {
  $.post('/restartserver', {apikey: key}, function() {});
});
$("#stop").click(function() {
  $.post('/stopserver', {apikey: key}, function() {});
  $("#start").show();
  $("#stop").hide();
});
$("#start").click(function() {
  $.post('/startserver', {apikey: key}, function() {});
  $("#stop").show();
  $("#start").hide();
});

// Hide start on page load
$(document).ready(function() {
  $("#start").hide();
})
