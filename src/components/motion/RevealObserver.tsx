"use client";

import { useEffect } from "react";

const STAGGER_MS = 160;
const MAX_STAGGER_STEPS = 8;

/**
 * Drives every `.reveal` element: it animates once, when that element
 * enters the visible screen — including sections the reader scrolls to
 * later. Phone browsers report a taller layout viewport than the area
 * actually on screen, so the check uses the visual viewport.
 *
 * Elements that enter together (a row of cards, a heading and its rule)
 * are staggered in document order. State lives in a data attribute, not a
 * class, so React re-renders never wipe it.
 *
 * Hiding is opt-in: `.reveal-js` goes on <html> only after observation is
 * set up, so with JS off or a failed setup the page stays fully visible.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const revealed = (element: Element) => element.getAttribute("data-revealed") === "in";

    const hasEntered = (element: Element) => {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return false;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const height = viewport?.height ?? window.innerHeight;
      const bottom = top + height;
      // Start once the block has crossed into the lower part of the screen.
      return rect.top < top + height * 0.86 && rect.bottom > top + 32 && rect.top < bottom;
    };

    const revealEntering = () => {
      const entering = [...document.querySelectorAll(".reveal")]
        .filter((element) => !revealed(element) && hasEntered(element))
        .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      entering.forEach((element, index) => {
        const step = Math.min(index, MAX_STAGGER_STEPS);
        (element as HTMLElement).style.setProperty("--reveal-delay", `${step * STAGGER_MS}ms`);
        element.setAttribute("data-revealed", "in");
        io?.unobserve(element);
      });
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        revealEntering();
      });
    };

    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) schedule();
            },
            { rootMargin: "0px 0px -8% 0px", threshold: [0, 0.12, 0.2] }
          );

    const track = (element: Element) => {
      if (revealed(element)) return;
      io?.observe(element);
    };

    const scan = (root: ParentNode) => root.querySelectorAll(".reveal").forEach(track);

    // Reveal what is already on screen before hiding the rest, so the first
    // view animates instead of flashing blank.
    revealEntering();
    scan(document);
    document.documentElement.classList.add("reveal-js");

    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) track(node);
          scan(node);
        });
      }
      schedule();
    });
    mo.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    window.visualViewport?.addEventListener("resize", schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mo.disconnect();
      io?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("scroll", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      document.documentElement.classList.remove("reveal-js");
    };
  }, []);

  return null;
}
