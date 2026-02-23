function determinePlatform() {
  const multiSite = document.getElementById("multiSite").value;
  const cloud = document.getElementById("cloud").value;
  const expansion = document.getElementById("expansion").value;
  const video = document.getElementById("video").value;

  let platform = "Net2";

  if (
    multiSite === "yes" ||
    cloud === "yes" ||
    expansion === "yes" ||
    video === "yes"
  ) {
    platform = "Paxton10";
  }

  document.getElementById("recommendation").innerText =
    "Recommended Platform: " + platform;
}
