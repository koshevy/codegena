/**
 * Release the HTML startup styles after the first styled view has committed.
 */
export function setPreloadingStateOff(): void {
  document.body.classList.remove('GlobalCSS__preloading');
}
