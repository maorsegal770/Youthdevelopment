import React from "react";
import ReactMarkdown from "react-markdown";

/** Renders editable text as Markdown (no raw HTML, so it is safe). */
export default function Rich({ children, className = "" }) {
  return (
    <div className={`space-y-3 leading-relaxed [&_h2]:text-xl [&_h2]:font-bold [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pr-5 [&_ol]:list-decimal [&_ol]:pr-5 [&_a]:text-primary [&_a]:underline ${className}`}>
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
}
