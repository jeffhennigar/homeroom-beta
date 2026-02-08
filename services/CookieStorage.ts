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
        const expires = d.toUTCString();
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        const domain = isLocal ? '' : 'domain=.ourhomeroom.app; ';
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';

        // v2.7: Strip large session data to essential tokens only (cookie size limit ~4KB)
        let processedValue = value;
        try {
            if (value && value.length > 3000) {
                const parsed = JSON.parse(value);
                if (parsed.access_token && parsed.refresh_token) {
                    const stripped = {
                        access_token: parsed.access_token,
                        refresh_token: parsed.refresh_token,
                        expires_at: parsed.expires_at,
                        expires_in: parsed.expires_in,
                        token_type: parsed.token_type || 'bearer'
                    };
                    processedValue = JSON.stringify(stripped);
                    console.log('[CookieStorage v2.7] Stripped session from', value.length, 'to', processedValue.length, 'bytes');
                }
            }
        } catch (e) {
            // Not JSON, use original value
        }

        document.cookie = `${key}=${encodeURIComponent(processedValue)}; expires=${expires}; path=/; ${domain}SameSite=Lax${secure}`;
        console.log('[CookieStorage v2.7] Set cookie:', key, 'size:', processedValue.length);
    },
    removeItem: (key: string): void => {
        const isLocal = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
        const domain = isLocal ? '' : 'domain=.ourhomeroom.app; ';
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain}SameSite=Lax${secure}`;
    }
};
