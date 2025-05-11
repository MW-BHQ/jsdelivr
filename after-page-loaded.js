document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    //initLoader();
  } else if (event.target.readyState === "complete") {
    initApp();
  }
});
 
function initApp(){
    //remove tally logo
  var tally_logo = document.getElementsByClassName('tally-powered');
  for (var i in tally_logo) {
    if (tally_logo.hasOwnProperty(i)) {
      tally_logo[i].style.display = "none";
    }
  }

};
