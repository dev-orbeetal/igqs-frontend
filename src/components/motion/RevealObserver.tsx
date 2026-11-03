"use client";

import { useEffect } from "react";

const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 5;

/**
 * Drives every `.reveal` element: it animates once, when it scrolls into
 * view — never on page load for content below the fold, and never again on
 * scrolling back up.
 *
 * Elements that enter together (a row of news cards, a heading and its
 * rule) are staggered in document order. Elements already on screen, or
 * scrolled past, when first seen are marked done and never hidden, so
 * nothing visible blinks out at hydration. State lives in a data attribute,
 * not a class, so React re-renders never wipe it.
 *
 * Hiding is opt-in: `.reveal-js` goes on <html> only after observation is
 * set up, so with JS off or a failed setup the page stays fully visible.
 */
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        entering.forEach((element, index) => {
          const step = Math.min(index, MAX_STAGGER_STEPS);
          (element as HTMLElement).style.setProperty("--reveal-delay", `${step * STAGGER_MS}ms`);
          element.setAttribute("data-revealed", "in");
          io.unobserve(element);
        });
      },
      { rootMargin: "0px 0px -10% 0px" }
    );

    const track = (element: Element) => {
      if (element.hasAttribute("data-revealed")) return;
      if (element.getBoundingClientRect().top < window.innerHeight) {
        element.setAttribute("data-revealed", "done");
      } else {
        io.observe(element);
      }
    };

    const scan = (root: ParentNode) => root.querySelectorAll(".reveal").forEach(track);

    scan(document);
    document.documentElement.classList.add("reveal-js");

    // Client-side navigations and carousels insert new nodes. Mutation
    // callbacks run before the next paint, so on-screen arrivals are marked
    // done before they could be hidden.
    const mo = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) track(node);
          scan(node);
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      document.documentElement.classList.remove("reveal-js");
    };
  }, []);

  return null;
}
