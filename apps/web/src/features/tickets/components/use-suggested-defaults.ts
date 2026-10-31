import { useState } from "react";

// An untouched form starts over from a suggestion that arrives while it's open.
// Once someone edits it, their work stays and the suggestion waits in its panel.
// Give formKey to the form, since its fields only read defaults when they mount.
export function useSuggestedDefaults<Defaults>(
  suggestionKey: string,
  suggested: Defaults,
) {
  const [isEdited, setIsEdited] = useState(false);
  const [applied, setApplied] = useState({
    key: suggestionKey,
    defaults: suggested,
  });

  if (!isEdited && applied.key !== suggestionKey) {
    setApplied({ key: suggestionKey, defaults: suggested });
  }

  function markEdited() {
    setIsEdited(true);
  }

  return { formKey: applied.key, defaults: applied.defaults, markEdited };
}
