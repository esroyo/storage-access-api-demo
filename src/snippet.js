async function doThingsWithCookies() {
    check.classList.add('hide');
    console.log('document.cookie:', document.cookie);
    if (document.cookie) {
        const [key, value] = document.cookie.split('=');
        userName.textContent = value;
        hello.classList.remove('hide');
        if (window.opener) {
          window.opener.postMessage({ action: 'reload' });
          setTimeout(() => { window.close(); }, 7000);
        }
    } else {
        login.classList.remove('hide');
    }
}

async function handleCookieAccess() {
    const hasAccess = await (document.hasStorageAccess?.() ?? true);
    if (hasAccess) {
        console.log('has access');
        // We have access to unpartitioned cookies, so let's go
        doThingsWithCookies();
    } else {
        console.log('does not have access');

        let permission;
        try {
            permission = await navigator.permissions.query({
                name: "storage-access",
            });
        } catch (error) {}

        console.log('permission query result', permission);
        if (!permission || permission.state === 'denied' || permission.state === 'prompt') {
            check.classList.remove('hide');
            console.log('Need to call requestStorageAccess() after a user interaction');
            checkButton.addEventListener("click", () => {
                document.requestStorageAccess().then(doThingsWithCookies, doThingsWithCookies);
            });
        } else {
            console.log('Should be possible to call requestStorageAccess() without user interaction...');
            console.log('According to docs (point 5): https://developer.mozilla.org/en-US/docs/Web/API/Storage_Access_API/Using#checking_and_requesting_storage_access');
            try {
                await document.requestStorageAccess();
                console.log('Could call requestStorageAccess() without user interaction, yay!');
                // We have access to unpartitioned cookies, so let's go
                doThingsWithCookies();
            } catch (err) {
                console.log('However it fails:', err);
                check.classList.remove('hide');
                console.log('Need to call requestStorageAccess() after a user interaction');
                checkButton.addEventListener("click", () => {
                    document.requestStorageAccess().then(doThingsWithCookies, doThingsWithCookies);
                });
            }
        }
    }
}

async function setupEventListeners() {
  window.addEventListener('message', (ev) => {
    console.log('received postMessage', ev?.data);
    if (ev?.data?.action === 'reload') location.reload();
  });
}

setupEventListeners();
handleCookieAccess();
