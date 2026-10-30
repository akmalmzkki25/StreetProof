import { createCn } from "cn/config";

export const cn = createCn({
  extend: {
    classGroups: {
      "type-scale": [
        "type-display-xl",
        "type-display",
        "type-headline",
        "type-title",
        "type-lead",
        "type-caption",
        "type-label-mono",
      ],
    },
    conflictingClassGroups: {
      "type-scale": [
        "font-size",
        "font-weight",
        "font-family",
        "leading",
        "tracking",
      ],
    },
  },
});
