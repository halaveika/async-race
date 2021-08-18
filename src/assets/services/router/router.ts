export class Router {
  routes: { path: string; cb: () => void }[] = [];

  current = '/';

  constructor() {
    this.listen();
  }

  add = (path: string, cb: () => void): Router => {
    this.routes.push({ path, cb });
    return this;
  };

  remove = (path: string): Router => {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].path === path) {
        this.routes.slice(i, 1);
        return this;
      }
    }
    return this;
  };

  flush = (): Router => {
    this.routes = [];
    return this;
  };

  clearSlashes = (path: string): string => path.toString().replace(/\/$/, '').replace(/^\//, '');

  getFragment = (): string => {
    let fragment = '';
    const match = window.location.href.match(/#(.*)$/);
    fragment = match ? match[1] : '';
    return this.clearSlashes(fragment);
  };

  navigate = (path = ''): Router => {
    window.location.href = `${window.location.href.replace(
      /#(.*)$/,
      '',
    )}#${path}`;
    return this;
  };

  listen = (): void => {
    this.current = window.location.href;
    if (this.current === this.getFragment()) return;
    this.current = this.getFragment();

    this.routes.some((route) => {
      const match = <string[]> this.current.match(route.path);
      if (match) {
        match.shift();
        route.cb.apply(this, match as []);
        return match;
      }
      return false;
    });
  };
}
