document.onreadystatechange = () => {
  if (document.readyState === "interactive") {
    document.getElementById("list-badge").style.listStyleType = 'none';
  }
};
