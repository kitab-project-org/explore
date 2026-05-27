import { useMemo, useState } from "react";
import { Box, Button, Checkbox, TextField, Typography } from "@mui/material";

const TocFilter = ({ toc, selectedSectionIds, setSelectedSectionIds }) => {
  const [expanded, setExpanded] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Build children map and top-level list once per toc change
  const { children, topLevel } = useMemo(() => {
    if (!toc) return { children: {}, topLevel: [] };
    const children = {};
    const topLevel = [];
    for (const idStr of Object.keys(toc.sections)) {
      const id = parseInt(idStr);
      const parent = toc.sections[idStr].parent;
      if (!parent) {
        topLevel.push(id);
      } else {
        if (!children[parent]) children[parent] = [];
        children[parent].push(id);
      }
    }
    topLevel.sort((a, b) => toc.sections[a].start_ms - toc.sections[b].start_ms);
    for (const pid of Object.keys(children)) {
      children[pid].sort((a, b) => toc.sections[a].start_ms - toc.sections[b].start_ms);
    }
    return { children, topLevel };
  }, [toc]);

  // Pre-compute the set of IDs that match or have a matching descendant
  const matchingIds = useMemo(() => {
    if (!toc || !searchQuery) return null;
    const q = searchQuery.toLowerCase();
    const result = new Set();
    const check = (id) => {
      const selfMatch = toc.sections[id]?.title?.toLowerCase().includes(q);
      const childMatch = (children[id] || []).some(childId => check(childId));
      if (selfMatch || childMatch) result.add(id);
      return selfMatch || childMatch;
    };
    topLevel.forEach(id => check(id));
    return result;
  }, [searchQuery, toc, children, topLevel]);

  if (!toc) return null;

  const toggleSection = (id) => {
    const next = new Set(selectedSectionIds ?? []);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedSectionIds(next.size > 0 ? next : null);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderSection = (id, depth = 0) => {
    const sec = toc.sections[id];
    if (!sec) return null;
    if (matchingIds && !matchingIds.has(id)) return null;
    const hasChildren = !!(children[id]?.length);
    // When searching: auto-expand parents of matches; otherwise use manual state
    const isExpanded = matchingIds
      ? (children[id] || []).some(childId => matchingIds.has(childId))
      : expanded.has(id);
    const isChecked = selectedSectionIds?.has(id) ?? false;

    return (
      <Box key={id}>
        <Box sx={{ display: "flex", direction: "rtl", alignItems: "center", pr: depth * 2 }}>
          <Box
            onClick={() => !matchingIds && hasChildren && toggleExpand(id)}
            sx={{
              width: 20,
              cursor: (hasChildren && !matchingIds) ? "pointer" : "default",
              flexShrink: 0,
              textAlign: "center",
              fontSize: "0.75em",
              userSelect: "none",
            }}
          >
            {hasChildren ? (isExpanded ? "▼" : "▶") : ""}
          </Box>
          <Checkbox
            size="small"
            checked={isChecked}
            onChange={() => toggleSection(id)}
            sx={{ py: 0.25, flexShrink: 0 }}
          />
          <Typography variant="body2" sx={{ flexGrow: 1, textAlign: "right" }}>
            {sec.title}
          </Typography>
        </Box>
        {isExpanded && hasChildren &&
          children[id].map(childId => renderSection(childId, depth + 1))
        }
      </Box>
    );
  };

  return (
    <Box sx={{ width: 280, margin: "20px" }}>
      <Typography gutterBottom sx={{ textAlign: "center" }}>Filter by section:</Typography>
      <TextField
        size="small"
        placeholder="Search sections..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputProps={{ dir: "rtl" }}
        sx={{ width: "100%", mb: 1 }}
      />
      <Box sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #ccc", borderRadius: 1, p: 1 }}>
        {topLevel.map(id => renderSection(id))}
      </Box>
      <Button
        size="small"
        onClick={() => setSelectedSectionIds(null)}
        disabled={!selectedSectionIds}
        sx={{ mt: 1, width: "100%" }}
      >
        Reset
      </Button>
    </Box>
  );
};

export default TocFilter;