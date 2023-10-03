import { CookieJar } from "https://deno.land/x/cookies/mod.ts";

Deno.serve(async (req: Request) => {
  const url = new URL (req.url);
  const cookieOptions = {
    maxAge: 60 * 5,
    sameSite: 'none',
    secure: true,
    httpOnly: false,
  };
  const res = {
    status: 200,
    headers: new Headers([
      ['Content-Type', 'text/html'],
    ]),
  };
  const isIframed = req.headers.get('Sec-Fetch-Dest') === 'iframe';
  let cookieJar = new CookieJar(req, res, cookieOptions);

  const doLogout = url.searchParams.get('logout') === 'true';
  if (doLogout) {
    cookieJar.delete('user', cookieOptions);
    res.status = 302;
    res.headers.set('Location', url.origin);
    return new Response('', res);
  }

  const jsCode = await Deno.readTextFile('./src/snippet.js');

  if (isIframed) {
        if (cookieJar.has('user')) {
            return new Response(`Hello, ${cookieJar.get('user')}! <form><input type="hidden" name="logout" value="true"/><button>Logout</button></form>`, res);
        } else {
            return new Response(`<button id="button">Check credentials</button><p>If nothing happens, you need to login</p><script>${jsCode}</script>`, res);
        }

    }

  const inputUser = url.searchParams.get('user');
  if (inputUser === '') {
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
      return new Response(`<form><input name="user"></intput> <button id="button">Login</button></form><script>${jsCode}</script>`, res);
  }
});
