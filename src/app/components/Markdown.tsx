import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  const flush = () => { if (list.length) { nodes.push(<ul key={`list-${nodes.length}`}>{list.map((item) => <li key={item}>{inline(item)}</li>)}</ul>); list = []; } };
  lines.forEach((line, index) => {
    if (line.startsWith("- ")) { list.push(line.slice(2)); return; }
    flush();
    if (!line.trim()) return;
    if (line.startsWith("### ")) nodes.push(<h3 key={index}>{inline(line.slice(4))}</h3>);
    else if (line.startsWith("## ")) nodes.push(<h2 key={index}>{inline(line.slice(3))}</h2>);
    else if (line.startsWith("# ")) nodes.push(<h1 key={index}>{inline(line.slice(2))}</h1>);
    else if (line.startsWith("> ")) nodes.push(<blockquote key={index}>{inline(line.slice(2))}</blockquote>);
    else nodes.push(<p key={index}>{inline(line)}</p>);
  });
  flush();
  return <div className="markdown-body">{nodes}</div>;
}
