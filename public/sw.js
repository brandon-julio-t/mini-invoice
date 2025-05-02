/** @docs https://nextjs.org/docs/app/guides/progressive-web-apps#5-creating-a-service-worker */
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  console.log("beforeinstallprompt", event);
});
