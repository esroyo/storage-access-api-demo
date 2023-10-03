import { CookieJar } from "https://deno.land/x/cookies/mod.ts";

Deno.serve(async (req: Request) => {
  const url = new URL (req.url);
  const cookieOptions = {
    maxAge: 60 * 5,
    sameSite: 'none',
    secure: true,
    httpOnly: false,
  };
  const inputUser = url.searchParams.get('user');
  const doLogout = url.searchParams.get('logout') === 'true';
  const res = {
    status: 200,
    headers: new Headers([
      ['Content-Type', 'text/html'],
    ]),
  };
  let cookieJar = new CookieJar(req, res, cookieOptions);
  if (doLogout || inputUser === '') {
    cookieJar.delete('user', cookieOptions);
    res.status = 302;
    res.headers.set('Location', url.origin);
    return new Response('', res);
  }
  if (inputUser) {
    cookieJar.set('user', inputUser, cookieOptions);
    res.status = 302;
    res.headers.set('Location', url.origin);
    return new Response('', res);
  }
  if (cookieJar.has('user') || inputUser) {
      return new Response(`Hello, ${cookieJar.get('user') || inputUser}! <form><input type="hidden" name="logout" value="true"/><button>Logout</button></form>`, res);
  } else {
      const jsCode = await Deno.readTextFile('./src/snippet.js');
      return new Response(`<form id="loginForm"><button id="autoBtn">autologin</button><hr /><input name="user"></intput> <button id="manualBtn">Login</button></form><script>${jsCode}</script>`, res);
  }
});
