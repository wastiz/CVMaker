/**
 * Re-flows the live preview document so its page breaks match what
 * openhtmltopdf produces for the real PDF.
 *
 * The preview renders one continuous HTML document that the editor slices into
 * A4 sheets. The browser ignores the `@page` margins and the `page-break-*`
 * rules the templates carry, so without this the slicing cuts entries in half.
 * Here we measure the laid-out document and insert spacer divs that push any
 * block which would straddle a sheet boundary onto the next sheet.
 */

export const A4_WIDTH = 794;
export const A4_HEIGHT = 1123;

/** Minimum content that has to follow a heading for it to stay on the page. */
const MIN_GLUE_PX = 48;

const SPACER_ATTR = "data-page-spacer";

/**
 * A unit that must not be split across sheets. `first`/`last` differ only for
 * a heading glued to the block that follows it.
 */
interface Block {
  first: HTMLElement;
  last: HTMLElement;
  /** Heading blocks may break after MIN_GLUE_PX instead of needing to fit whole. */
  isHeading: boolean;
}

function isEntry(el: Element): boolean {
  return el.classList.contains("entry");
}

/** Containers we look through rather than treat as atomic units. */
function isTransparentContainer(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (["table", "tbody", "tr", "td"].includes(tag)) return true;
  // A plain wrapper div (section grouping) — but not an entry, which is atomic.
  return tag === "div" && !isEntry(el);
}

function collectBlocks(container: Element, out: Block[]): void {
  const children = Array.from(container.children) as HTMLElement[];

  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    if (el.hasAttribute(SPACER_ATTR)) continue;

    // The sidebar template's coloured column is one continuous band next to the
    // main column. Spacers there would inflate the shared table row instead of
    // moving anything, so it is left to flow.
    if (el.classList.contains("sidebar")) continue;

    if (isEntry(el)) {
      out.push({ first: el, last: el, isHeading: false });
      continue;
    }

    const tag = el.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2" || tag === "h3") {
      const next = children[i + 1];
      // Glue the heading to whatever follows it so it never sits alone at the
      // bottom of a sheet.
      out.push({ first: el, last: next ?? el, isHeading: true });
      continue;
    }

    if (isTransparentContainer(el)) {
      collectBlocks(el, out);
      continue;
    }

    out.push({ first: el, last: el, isHeading: false });
  }
}

/**
 * Inserts page spacers into `doc` and returns the resulting sheet count.
 * Safe to call repeatedly — spacers from a previous run are removed first.
 */
export function paginatePreview(doc: Document): { pageCount: number; height: number } {
  const body = doc.body;
  const view = doc.defaultView;
  if (!body || !view) return { pageCount: 1, height: A4_HEIGHT };

  doc.querySelectorAll(`[${SPACER_ATTR}]`).forEach((n) => n.remove());

  // The templates mirror their `@page` margin onto the body for screen, so the
  // usable strip of each sheet is what is left after the vertical margins.
  const style = view.getComputedStyle(body);
  const marginTop = parseFloat(style.marginTop) || 0;
  const marginBottom = parseFloat(style.marginBottom) || 0;
  const usable = A4_HEIGHT - marginTop - marginBottom;

  if (usable <= 0) {
    const height = doc.documentElement.scrollHeight;
    return { pageCount: Math.max(1, Math.ceil(height / A4_HEIGHT)), height };
  }

  const blocks: Block[] = [];
  collectBlocks(body, blocks);

  let page = 0;

  for (const block of blocks) {
    const top = block.first.getBoundingClientRect().top;
    const bottom = block.last.getBoundingClientRect().bottom;

    // Blocks are in document order, so catch up to the sheet this one starts on.
    let limit = page * A4_HEIGHT + marginTop + usable;
    while (top >= limit) {
      page++;
      limit = page * A4_HEIGHT + marginTop + usable;
    }

    // How far down the block has to reach before a break is acceptable.
    const needed = block.isHeading
      ? Math.min(bottom, top + block.first.getBoundingClientRect().height + MIN_GLUE_PX)
      : bottom;

    if (needed <= limit) continue;

    // Taller than a whole sheet — it has to split wherever it lands.
    if (!block.isHeading && bottom - top > usable) continue;

    const nextSheetTop = (page + 1) * A4_HEIGHT + marginTop;
    const gap = nextSheetTop - top;
    if (gap <= 0) continue;

    const spacer = doc.createElement("div");
    spacer.setAttribute(SPACER_ATTR, "");
    spacer.style.height = `${gap}px`;
    block.first.parentNode?.insertBefore(spacer, block.first);
    page++;
  }

  const height = doc.documentElement.scrollHeight;
  return { pageCount: Math.max(1, Math.ceil(height / A4_HEIGHT)), height };
}

/**
 * Runs pagination once webfonts have settled — measuring before they load
 * produces a layout that shifts underneath us.
 */
export function paginateWhenReady(
  doc: Document,
  onDone: (result: { pageCount: number; height: number }) => void
): void {
  const run = () => onDone(paginatePreview(doc));
  const fonts = (doc as Document & { fonts?: FontFaceSet }).fonts;
  if (fonts?.ready) {
    fonts.ready.then(run).catch(run);
  } else {
    run();
  }
}
