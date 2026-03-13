export const CookieStorage = {
    getItem: (key: string): string | null => {
        const name = key + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            const c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                try { return decodeURIComponent(c.substring(name.length)); }
                catch (e) { return c.substring(name.length); }
            }
        }
        return null;
    },
    setItem: (key: string, value: string): void => {
        const d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
        const expires = d.toUTCString();
        const host = window.location.hostname;
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';

        // v2.7: Strip large session data to essential tokens only (cookie size limit ~4KB)
        let processedValue = value;
        try {
            if (value && value.length > 3000) {
                const parsed = JSON.parse(value);
                if (parsed.access_token && parsed.refresh_token) {
                    // v2.8: Keep user object (sans identities) for _emitInitialSession
                    let minUser = parsed.user;
                    if (minUser && typeof minUser === 'object') {
                        const { identities, ...rest } = minUser;
                        minUser = rest;
                    }
                    const stripped = {
                        access_token: parsed.access_token,
                        refresh_token: parsed.refresh_token,
                        expires_at: parsed.expires_at,
                        expires_in: parsed.expires_in,
                        token_type: parsed.token_type || 'bearer',
                        user: minUser
                    };
                    processedValue = JSON.stringify(stripped);
                    console.log('[CookieStorage v2.8] Stripped session (keeping user) from', value.length, 'to', processedValue.length, 'bytes');
                }
            }
        } catch (e) {
            // Not JSON, use original value
        }

        // Aggressive clear before setting (legacy parity — prevents stale cookie data)
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax; Secure`;

        let cookieStr = `${key}=${encodeURIComponent(processedValue)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
        if (!isLocal && host.includes('ourhomeroom.app')) {
            // v2.7: Use leading dot for explicit cross-subdomain sharing
            cookieStr = `${key}=${encodeURIComponent(processedValue)}; expires=${expires}; path=/; domain=.ourhomeroom.app; SameSite=Lax${secure}`;
        }
        document.cookie = cookieStr;
        console.log('[CookieStorage v2.7] Set cookie:', key, 'size:', processedValue.length);
    },
    removeItem: (key: string): void => {
        const host = window.location.hostname;
        const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secure}`;
        if (!isLocal && host.includes('ourhomeroom.app')) {
            document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.ourhomeroom.app; SameSite=Lax${secure}`;
        }
    }
};
