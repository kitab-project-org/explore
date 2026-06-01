function findSections(starts, ms) {
  let lo = 0, hi = starts.length - 1;
  let previousSections = [];
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const [startMs, sectionIds, previousOpen] = starts[mid];
    if (startMs === ms) {
      return previousOpen === null ? sectionIds : [previousOpen, ...sectionIds];
    }
    if (startMs < ms) {
      previousSections = sectionIds;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return previousSections.length ? [previousSections[previousSections.length - 1]] : [];
}

function walkTree(sections, sectionId, trail = []) {
  const { title, parent } = sections[sectionId];
  trail.push(title);
  if (parent) walkTree(sections, parent, trail);
  return trail;
}

function buildTree(paths) {
  const tree = {};
  for (const path of paths) {
    let node = tree;
    for (const title of path) {
      if (!node[title]) node[title] = {};
      node = node[title];
    }
  }
  return tree;
}

function renderTree(subtree) {
  const items = Object.entries(subtree).map(([title, children]) => {
    const nested = Object.keys(children).length > 0 ? renderTree(children) : "";
    return `<li>${title}${nested}</li>`;
  });
  return `<ul style="margin:2px 0;padding-right:14px;padding-left:0;">${items.join("")}</ul>`;
}

/**
 * Return the full ancestor hierarchy for a known section ID as an RTL HTML string.
 */
export function getSectionHierarchy(toc, sectionId) {
  if (!toc?.sections?.[sectionId]) return "";
  const path = walkTree(toc.sections, sectionId, []).reverse();
  const tree = buildTree([path]);
  if (Object.keys(tree).length === 0) return "";
  return `<div dir="rtl">${renderTree(tree)}</div>`;
}

/**
 * Return section headings for a milestone as an RTL HTML string with nested <ul>/<li>,
 * or an empty string when TOC is unavailable or the milestone is out of range.
 */
export function getMilestoneHeadings(toc, ms) {
  if (!toc || ms > toc.last_ms) return "";
  const sectionIds = findSections(toc.starts, ms);
  const paths = sectionIds.map(sectionId => walkTree(toc.sections, sectionId, []).reverse());
  const tree = buildTree(paths);
  if (Object.keys(tree).length === 0) return "";
  return `<div dir="rtl">${renderTree(tree)}</div>`;
}