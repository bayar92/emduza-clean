declare module "react-quill" {
  import * as React from "react";

  export interface ReactQuillModuleConfig {
    syntax?: {
      highlight?: (text: string) => string;
    };
    toolbar?: unknown;
    [key: string]: unknown;
  }

  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    onChange?: (
      value: string,
      delta: unknown,
      source: string,
      editor: unknown
    ) => void;
    modules?: ReactQuillModuleConfig;
    formats?: string[];
    theme?: string;
    style?: React.CSSProperties;
    readOnly?: boolean;
    placeholder?: string;
    bounds?: string | HTMLElement;
  }

  export default class ReactQuill extends React.Component<ReactQuillProps> {}
}

