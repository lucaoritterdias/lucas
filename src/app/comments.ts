/**
 * Article comments via giscus (GitHub Discussions).
 *
 * Setup, once:
 * 1. Use a PUBLIC GitHub repo (giscus can't read private ones) and enable Discussions on it.
 * 2. Install the giscus app on that repo: https://github.com/apps/giscus
 * 3. Open https://giscus.app, enter the repo, pick a category (e.g. "Comentários",
 *    type Announcements so only you can open new threads) and copy the ids below.
 *
 * While `repo` is empty the comments section isn't rendered.
 */
export const GISCUS = {
  repo: "lucaoritterdias/lucas",
  repoId: "R_kgDOSLAF4Q",
  category: "Announcements",
  categoryId: "DIC_kwDOSLAF4c4DFmaW",
};

export const commentsEnabled = Boolean(GISCUS.repo && GISCUS.repoId && GISCUS.category && GISCUS.categoryId);
