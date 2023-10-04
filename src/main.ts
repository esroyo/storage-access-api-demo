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
      ['Cross-Origin-Opener-Policy', 'unsafe-none'],
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

const linkAttrs = isIframed ? ' rel="opener" target="_blank"' : '';
const logoutNotice = isIframed ? '' : '<p><marquee direction="down" width="600px" height="100px">⚠ This tab will auto-close in some seconds ⚠</marquee></p>';
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login demo</title>
  <style>.hide { display: none; }</style>
</head>
<body>
<section id="check" class="hide">
  I don't know who you are. Let me check by clicking here:
  <button id="checkButton">Check</button>
</section>
<section id="hello" class="hide">
  Hello, <span id="userName"></span>! <form><input type="hidden" name="logout" value="true"/><button>Logout</button></form>
  ${logoutNotice}
</section>
<section id="login" class="hide">
  <form${linkAttrs}><input id="user" name="user" value=""></intput><button>Login</button></form>
</section>
<script>${jsCode}</script>
</html>
`;
    return new Response(html, res);
});
