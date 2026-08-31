import { Header } from "../../components/Header";
const journey = [
  ["At 14", "The first WordPress websites", "Websites became a practical school for themes, plugins, servers, and real clients long before formal education."],
  ["Freelance", "Original projects and a client base", "Independent work across different projects, combining new product development with the care of live systems."],
  ["Multinational", "IT infrastructure", "Experience in information technology infrastructure strengthened the foundation in networks, servers, and operations."],
  ["Education", "Systems Analysis and Development", "A degree from Unisinos added formal grounding to years of practical experience."],
  ["The turning point", "R&D Systems was founded", "Freelance work became a structured operation, growing for a year and a half before the next chapter."],
  ["Today", "CTO and partner at Polvor", "Lucas leads development, architecture, infrastructure, and innovation with a long-term product vision."],
];
export const metadata = { title: "About · Lucas Ritter Dias" };
export default function AboutPage() { return <><Header/><main className="route-page"><header className="route-hero"><p>Lucas Ritter Dias</p><h1>Project after project,<br/><em>a trajectory.</em></h1><span>A developer since 14. Today, CTO and partner at Polvor.</span></header><section className="route-about"><div className="route-timeline">{journey.map(([when,title,text],i) => <article key={title}><span>0{i+1} · {when}</span><h2>{title}</h2><p>{text}</p></article>)}</div><aside><p>Focus</p>{[["Product","Digital products · Discovery · Experience"],["Engineering","Architecture · Front-end · Back-end · Data"],["Operations","Infrastructure · Deployment · Reliability"],["Leadership","Technical direction · Teams · Business"]].map(([title,text]) => <div key={title}><h3>{title}</h3><p>{text}</p></div>)}</aside></section></main></>; }
