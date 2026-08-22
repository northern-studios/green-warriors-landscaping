// Each block is only fetched when its custom element is actually present in the
// markup being mounted, so the homepage never pays for blocks it doesn't use.
const loadIfPresent = async (tag, load, scope = document) => {
  if (scope.getElementsByTagName(tag).length > 0) await load();
};

const loadComponents = (scope = document) =>
  new Promise((resolve) => {
    const pending = [
      loadIfPresent('c-cover-home', () => import('./blocks/CoverHome.js'), scope),
      loadIfPresent('c-parallax-image', () => import('./blocks/ParallaxImage.js'), scope),
      loadIfPresent('c-works', () => import('./blocks/Works.js'), scope),
      loadIfPresent('c-title', () => import('./blocks/Title.js'), scope),
      loadIfPresent('c-subtitle', () => import('./blocks/Subtitle.js'), scope),
      loadIfPresent('c-content', () => import('./blocks/Content.js'), scope),
    ];
    Promise.all(pending).then(() => resolve());
  });

export default loadComponents;
