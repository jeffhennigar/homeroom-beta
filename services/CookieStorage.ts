export const CookieStorage = {
    getItem: (key: string): string | null => {
        const name = key + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
        const expires = "expires=" + d.toUTCString();
        // Default to strict for localhost, lax/domain for production
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        const domain = isLocal ? '' : 'domain=.ourhomeroom.app;';
        document.cookie = key + "=" + value + ";" + expires + ";path=/;" + domain + "SameSite=Lax;Secure";
    },
    removeItem: (key: string): void => {
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        const domain = isLocal ? '' : 'domain=.ourhomeroom.app;';
        document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;" + domain + "SameSite=Lax;Secure";
    }
};
