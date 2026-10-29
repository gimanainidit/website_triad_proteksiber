/** Freezes page scroll and keeps layout from shifting. Returns the function that undoes it. */
export function lockScroll(): () => void {
  const root = document.documentElement;
  const before = { overflow: root.style.overflow, paddingRight: document.body.style.paddingRight };
  const scrollbar = window.innerWidth - root.clientWidth;
  document.body.style.paddingRight = `${scrollbar}px`;
  root.style.overflow = "hidden";
  return () => {
    root.style.overflow = before.overflow;
    // removeProperty rather than assigning "", which jsdom's CSSStyleDeclaration ignores
    if (before.paddingRight) document.body.style.paddingRight = before.paddingRight;
    else document.body.style.removeProperty("padding-right");
  };
}
