function doThingsWithCookies() {
    if (document.cookie) {
        const [key, value] = document.cookie.split('=');
        button.parentNode.innerHTML = `Hello, ${value}! <form><input type="hidden" name="logout" value="true"/><button>Logout</button></form>`;
    }
}

async function handleCookieAccess() {
    if (!document.hasStorageAccess) {
        // This browser doesn't support the Storage Access API
        // so let's just hope we have access!
        doThingsWithCookies();
    } else {
        const hasAccess = await document.hasStorageAccess();
        if (hasAccess) {
            console.log('has access');
            // We have access to unpartitioned cookies, so let's go
            doThingsWithCookies();
        } else {
            console.log('does not have access');
            // Need to call requestStorageAccess() after a user interaction
            button.addEventListener("click", () => {
                try {
                    document.requestStorageAccess().then(() => {
                        doThingsWithCookies();
                    });
                } catch (err) {
                    // If there is an error obtaining storage access.
                    console.error(`Error obtaining storage access: ${err}.
                            Please sign in.`);
                }
            });
        }
    }
}

handleCookieAccess();
