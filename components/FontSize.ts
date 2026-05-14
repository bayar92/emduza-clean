import { Mark } from "@tiptap/core";

export interface FontSizeOptions {
  types: string[];
}

export const FontSize = Mark.create<FontSizeOptions>({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (el) => el.style.fontSize || null,
        renderHTML: (attrs) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
    };
  },

  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark("fontSize", { fontSize: size }).run(),

      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().unsetMark("fontSize").run(),
    };
  },
});
