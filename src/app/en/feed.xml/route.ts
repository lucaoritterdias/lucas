import { feedResponse } from "../../feed";

export const dynamic = "force-static";

export function GET() {
  return feedResponse("en");
}
