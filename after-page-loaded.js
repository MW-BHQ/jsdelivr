document.addEventListener("readystatechange", (event) => {
  if (event.target.readyState === "interactive") {
    initLoader();
  } else if (event.target.readyState === "complete") {
    initApp();
  }
});

function initApp(){
    //remove tally logo
    document.getElementsByClassName("tally-powered").style.display = "none";
}
