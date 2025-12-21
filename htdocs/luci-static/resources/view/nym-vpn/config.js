'use strict';
'require view';
'require rpc';
'require ui';
'require poll';
'require dom';

// Inline SVG assets (for LuCI compatibility)
var svgAssets = {
    logo: '<svg width="89" height="24" viewBox="0 0 89 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M0 2.23999C0 1.00288 1.00579 0 2.2465 0H10.4256C11.8792 0 13.1513 0.974115 13.5263 2.37439L18.7506 21.8815C18.8474 22.2432 19.3816 22.1733 19.3816 21.799V0H25.8001V21.7599C25.8001 22.997 24.7943 23.9999 23.5536 23.9999H15.314C13.8643 23.9999 12.5946 23.0308 12.216 21.6355L7.04928 2.5892C6.95141 2.22844 6.41855 2.29902 6.41855 2.67275V23.9999H0V2.23999Z"/><path d="M55.5159 2.45228e-05C54.2752 2.52007e-05 53.2694 1.0029 53.2694 2.24002V23.9999H59.6879V2.68233C59.6879 2.29548 60.2483 2.24066 60.3237 2.62013L64.0601 21.4219C64.3579 22.9203 65.6762 23.9999 67.2082 23.9999L74.6942 23.9999C76.2294 23.9999 77.5496 22.9158 77.8439 21.4135L81.5171 2.66662C81.5916 2.28643 82.153 2.34061 82.153 2.72798V23.9999H88.5714V2.24002C88.5714 1.0029 87.5656 2.5199e-05 86.3249 2.45188e-05L78.3813 2.01644e-05C76.859 1.93299e-05 75.5461 1.06646 75.2383 2.55306L71.2361 21.8844C71.1655 22.2251 70.6773 22.2246 70.6074 21.8838L66.6405 2.55837C66.3349 1.06926 65.0208 1.93293e-05 63.4964 2.01623e-05L55.5159 2.45228e-05Z"/><path d="M26.5569 9.04583e-05H33.3531L39.2253 12.5169C39.4563 13.0093 40.1589 13.0085 40.3888 12.5155L46.2237 9.04583e-05H53.1458L41.8949 24H34.9858L39.4713 14.4H35.3564C34.1107 14.4 32.9775 13.6813 32.4496 12.5563L26.5569 9.04583e-05Z"/></svg>',
    qualityHigh: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6667 5.5 18.3462V15.6538C5.5 15.3333 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3333 7.80775 15.6538V18.3462C7.80775 18.6667 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5ZM12.5578 19.5C12.2372 19.5 11.9648 19.3878 11.7405 19.1635C11.5162 18.9392 11.404 18.6667 11.404 18.3462V10.6538C11.404 10.3333 11.5162 10.0608 11.7405 9.8365C11.9648 9.61217 12.2372 9.5 12.5578 9.5C12.8783 9.5 13.1507 9.61217 13.375 9.8365C13.5993 10.0608 13.7115 10.3333 13.7115 10.6538V18.3462C13.7115 18.6667 13.5993 18.9392 13.375 19.1635C13.1507 19.3878 12.8783 19.5 12.5578 19.5ZM18.3462 19.5C18.0257 19.5 17.7533 19.3878 17.5288 19.1635C17.3044 18.9392 17.1923 18.6667 17.1923 18.3462V5.65375C17.1923 5.33325 17.3044 5.06083 17.5288 4.8365C17.7533 4.61217 18.0257 4.5 18.3462 4.5C18.6667 4.5 18.9392 4.61217 19.1635 4.8365C19.3878 5.06083 19.5 5.33325 19.5 5.65375V18.3462C19.5 18.6667 19.3878 18.9392 19.1635 19.1635C18.9392 19.3878 18.6667 19.5 18.3462 19.5Z" fill="#14E76F"/></svg>',
    qualityMedium: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6667 5.5 18.3462V15.6538C5.5 15.3333 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3333 7.80775 15.6538V18.3462C7.80775 18.6667 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5ZM12.5578 19.5C12.2372 19.5 11.9648 19.3878 11.7405 19.1635C11.5162 18.9392 11.404 18.6667 11.404 18.3462V10.6538C11.404 10.3333 11.5162 10.0608 11.7405 9.8365C11.9648 9.61217 12.2372 9.5 12.5578 9.5C12.8783 9.5 13.1507 9.61217 13.375 9.8365C13.5993 10.0608 13.7115 10.3333 13.7115 10.6538V18.3462C13.7115 18.6667 13.5993 18.9392 13.375 19.1635C13.1507 19.3878 12.8783 19.5 12.5578 19.5ZM18.3462 19.5C18.0257 19.5 17.7533 19.3878 17.5288 19.1635C17.3044 18.9392 17.1923 18.6667 17.1923 18.3462V5.65375C17.1923 5.33325 17.3044 5.06083 17.5288 4.8365C17.7533 4.61217 18.0257 4.5 18.3462 4.5C18.6667 4.5 18.9392 4.61217 19.1635 4.8365C19.3878 5.06083 19.5 5.33325 19.5 5.65375V18.3462C19.5 18.6667 19.3878 18.9392 19.1635 19.1635C18.9392 19.3878 18.6667 19.5 18.3462 19.5Z" fill="#606060"/><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6667 5.5 18.3463V15.6537C5.5 15.3333 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3333 7.80775 15.6537V18.3463C7.80775 18.6667 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5ZM12.5578 19.5C12.2373 19.5 11.9648 19.3878 11.7405 19.1635C11.5162 18.9392 11.404 18.6667 11.404 18.3463V10.6538C11.404 10.3333 11.5162 10.0608 11.7405 9.8365C11.9648 9.61217 12.2373 9.5 12.5578 9.5C12.8783 9.5 13.1507 9.61217 13.375 9.8365C13.5993 10.0608 13.7115 10.3333 13.7115 10.6538V18.3463C13.7115 18.6667 13.5993 18.9392 13.375 19.1635C13.1507 19.3878 12.8783 19.5 12.5578 19.5Z" fill="#FFB400"/></svg>',
    qualityLow: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6667 5.5 18.3462V15.6538C5.5 15.3333 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3333 7.80775 15.6538V18.3462C7.80775 18.6667 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5ZM12.5578 19.5C12.2372 19.5 11.9648 19.3878 11.7405 19.1635C11.5162 18.9392 11.404 18.6667 11.404 18.3462V10.6538C11.404 10.3333 11.5162 10.0608 11.7405 9.8365C11.9648 9.61217 12.2372 9.5 12.5578 9.5C12.8783 9.5 13.1507 9.61217 13.375 9.8365C13.5993 10.0608 13.7115 10.3333 13.7115 10.6538V18.3462C13.7115 18.6667 13.5993 18.9392 13.375 19.1635C13.1507 19.3878 12.8783 19.5 12.5578 19.5ZM18.3462 19.5C18.0257 19.5 17.7533 19.3878 17.5288 19.1635C17.3044 18.9392 17.1923 18.6667 17.1923 18.3462V5.65375C17.1923 5.33325 17.3044 5.06083 17.5288 4.8365C17.7533 4.61217 18.0257 4.5 18.3462 4.5C18.6667 4.5 18.9392 4.61217 19.1635 4.8365C19.3878 5.06083 19.5 5.33325 19.5 5.65375V18.3462C19.5 18.6667 19.3878 18.9392 19.1635 19.1635C18.9392 19.3878 18.6667 19.5 18.3462 19.5Z" fill="#5F6368"/><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6668 5.5 18.3463V15.6537C5.5 15.3332 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3332 7.80775 15.6537V18.3463C7.80775 18.6668 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5Z" fill="#ED5060"/></svg>',
    qualityOffline: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6667 5.5 18.3462V15.6538C5.5 15.3333 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3333 7.80775 15.6538V18.3462C7.80775 18.6667 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5ZM12.5578 19.5C12.2373 19.5 11.9648 19.3878 11.7405 19.1635C11.5162 18.9392 11.404 18.6667 11.404 18.3462V10.6538C11.404 10.3333 11.5162 10.0608 11.7405 9.8365C11.9648 9.61217 12.2373 9.5 12.5578 9.5C12.8783 9.5 13.1507 9.61217 13.375 9.8365C13.5993 10.0608 13.7115 10.3333 13.7115 10.6538V18.3462C13.7115 18.6667 13.5993 18.9392 13.375 19.1635C13.1507 19.3878 12.8783 19.5 12.5578 19.5ZM18.3462 19.5C18.0257 19.5 17.7533 19.3878 17.5288 19.1635C17.3044 18.9392 17.1923 18.6667 17.1923 18.3462V5.65375C17.1923 5.33325 17.3044 5.06083 17.5288 4.8365C17.7533 4.61217 18.0257 4.5 18.3462 4.5C18.6667 4.5 18.9392 4.61217 19.1635 4.8365C19.3878 5.06083 19.5 5.33325 19.5 5.65375V18.3462C19.5 18.6667 19.3878 18.9392 19.1635 19.1635C18.9392 19.3878 18.6667 19.5 18.3462 19.5Z" fill="#606060"/><path d="M6.65375 19.5C6.33325 19.5 6.06083 19.3878 5.8365 19.1635C5.61217 18.9392 5.5 18.6668 5.5 18.3463V15.6537C5.5 15.3332 5.61217 15.0608 5.8365 14.8365C6.06083 14.6122 6.33325 14.5 6.65375 14.5C6.97425 14.5 7.24675 14.6122 7.47125 14.8365C7.69558 15.0608 7.80775 15.3332 7.80775 15.6537V18.3463C7.80775 18.6668 7.69558 18.9392 7.47125 19.1635C7.24675 19.3878 6.97425 19.5 6.65375 19.5Z" fill="#606060"/></svg>'
};

// Country code to flag emoji and name mapping
var countryData = {
    'AE': { flag: '🇦🇪', name: 'United Arab Emirates' },
    'AL': { flag: '🇦🇱', name: 'Albania' },
    'AM': { flag: '🇦🇲', name: 'Armenia' },
    'AR': { flag: '🇦🇷', name: 'Argentina' },
    'AT': { flag: '🇦🇹', name: 'Austria' },
    'AU': { flag: '🇦🇺', name: 'Australia' },
    'BE': { flag: '🇧🇪', name: 'Belgium' },
    'BG': { flag: '🇧🇬', name: 'Bulgaria' },
    'BH': { flag: '🇧🇭', name: 'Bahrain' },
    'BO': { flag: '🇧🇴', name: 'Bolivia' },
    'BR': { flag: '🇧🇷', name: 'Brazil' },
    'CA': { flag: '🇨🇦', name: 'Canada' },
    'CH': { flag: '🇨🇭', name: 'Switzerland' },
    'CL': { flag: '🇨🇱', name: 'Chile' },
    'CO': { flag: '🇨🇴', name: 'Colombia' },
    'CR': { flag: '🇨🇷', name: 'Costa Rica' },
    'CY': { flag: '🇨🇾', name: 'Cyprus' },
    'CZ': { flag: '🇨🇿', name: 'Czech Republic' },
    'DE': { flag: '🇩🇪', name: 'Germany' },
    'EC': { flag: '🇪🇨', name: 'Ecuador' },
    'EE': { flag: '🇪🇪', name: 'Estonia' },
    'ES': { flag: '🇪🇸', name: 'Spain' },
    'FI': { flag: '🇫🇮', name: 'Finland' },
    'FR': { flag: '🇫🇷', name: 'France' },
    'GB': { flag: '🇬🇧', name: 'United Kingdom' },
    'GR': { flag: '🇬🇷', name: 'Greece' },
    'GT': { flag: '🇬🇹', name: 'Guatemala' },
    'HK': { flag: '🇭🇰', name: 'Hong Kong' },
    'HR': { flag: '🇭🇷', name: 'Croatia' },
    'HU': { flag: '🇭🇺', name: 'Hungary' },
    'ID': { flag: '🇮🇩', name: 'Indonesia' },
    'IE': { flag: '🇮🇪', name: 'Ireland' },
    'IL': { flag: '🇮🇱', name: 'Israel' },
    'IN': { flag: '🇮🇳', name: 'India' },
    'IS': { flag: '🇮🇸', name: 'Iceland' },
    'IT': { flag: '🇮🇹', name: 'Italy' },
    'JP': { flag: '🇯🇵', name: 'Japan' },
    'KH': { flag: '🇰🇭', name: 'Cambodia' },
    'KR': { flag: '🇰🇷', name: 'South Korea' },
    'LT': { flag: '🇱🇹', name: 'Lithuania' },
    'LV': { flag: '🇱🇻', name: 'Latvia' },
    'MD': { flag: '🇲🇩', name: 'Moldova' },
    'MK': { flag: '🇲🇰', name: 'North Macedonia' },
    'MX': { flag: '🇲🇽', name: 'Mexico' },
    'MY': { flag: '🇲🇾', name: 'Malaysia' },
    'NG': { flag: '🇳🇬', name: 'Nigeria' },
    'NL': { flag: '🇳🇱', name: 'Netherlands' },
    'NO': { flag: '🇳🇴', name: 'Norway' },
    'NZ': { flag: '🇳🇿', name: 'New Zealand' },
    'PE': { flag: '🇵🇪', name: 'Peru' },
    'PK': { flag: '🇵🇰', name: 'Pakistan' },
    'PL': { flag: '🇵🇱', name: 'Poland' },
    'PT': { flag: '🇵🇹', name: 'Portugal' },
    'RO': { flag: '🇷🇴', name: 'Romania' },
    'RS': { flag: '🇷🇸', name: 'Serbia' },
    'RU': { flag: '🇷🇺', name: 'Russia' },
    'SE': { flag: '🇸🇪', name: 'Sweden' },
    'SG': { flag: '🇸🇬', name: 'Singapore' },
    'SI': { flag: '🇸🇮', name: 'Slovenia' },
    'SK': { flag: '🇸🇰', name: 'Slovakia' },
    'TR': { flag: '🇹🇷', name: 'Turkey' },
    'TW': { flag: '🇹🇼', name: 'Taiwan' },
    'UA': { flag: '🇺🇦', name: 'Ukraine' },
    'US': { flag: '🇺🇸', name: 'United States' },
    'VN': { flag: '🇻🇳', name: 'Vietnam' },
    'ZA': { flag: '🇿🇦', name: 'South Africa' }
};

var callStatus = rpc.declare({
    object: 'nym-vpn',
    method: 'status',
    params: []
});

var callConnect = rpc.declare({
    object: 'nym-vpn',
    method: 'connect',
    params: []
});

var callDisconnect = rpc.declare({
    object: 'nym-vpn',
    method: 'disconnect',
    params: []
});

var callInfo = rpc.declare({
    object: 'nym-vpn',
    method: 'info',
    params: []
});

var callGatewayGet = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_get',
    params: []
});

var callGatewaySet = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_set',
    params: ['entry_country', 'exit_country', 'entry_id', 'exit_id', 'entry_random', 'exit_random', 'residential_exit']
});

var callGatewayListCountries = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_list_countries',
    params: ['gateway_type']
});

var callGatewayListByCountry = rpc.declare({
    object: 'nym-vpn',
    method: 'gateway_list_by_country',
    params: ['gateway_type', 'country_code']
});

var callTunnelGet = rpc.declare({
    object: 'nym-vpn',
    method: 'tunnel_get',
    params: []
});

var callTunnelSet = rpc.declare({
    object: 'nym-vpn',
    method: 'tunnel_set',
    params: ['ipv6', 'two_hop']
});

var callAccountGet = rpc.declare({
    object: 'nym-vpn',
    method: 'account_get',
    params: []
});

var callAccountSet = rpc.declare({
    object: 'nym-vpn',
    method: 'account_set',
    params: ['mnemonic', 'mode']
});

var callAccountForget = rpc.declare({
    object: 'nym-vpn',
    method: 'account_forget',
    params: []
});

var callAccountRotateKeys = rpc.declare({
    object: 'nym-vpn',
    method: 'account_rotate_keys',
    params: []
});

var callNetworkGet = rpc.declare({
    object: 'nym-vpn',
    method: 'network_get',
    params: []
});

var callLanGet = rpc.declare({
    object: 'nym-vpn',
    method: 'lan_get',
    params: []
});

var callLanSet = rpc.declare({
    object: 'nym-vpn',
    method: 'lan_set',
    params: ['policy']
});

// Main theme CSS
var themeCSS = `
    /* ═══════════════════════════════════════════════════════════════
       NYM VPN - Dark Theme
       ═══════════════════════════════════════════════════════════════ */

    :root {
        --nym-green: #00ff94;
        --nym-green-dim: rgba(0, 255, 148, 0.15);
        --nym-green-glow: rgba(0, 255, 148, 0.4);
        --bg-primary: #121218;
        --bg-secondary: #1a1a24;
        --bg-card: #1e1e2a;
        --bg-card-hover: #252532;
        --bg-input: #0d0d12;
        --border-color: #2a2a3a;
        --border-accent: #3a3a4a;
        --text-primary: #e8e8ec;
        --text-secondary: #9090a0;
        --text-muted: #606070;
        --danger: #ff4757;
        --danger-dim: rgba(255, 71, 87, 0.15);
        --warning: #ffa502;
        --warning-dim: rgba(255, 165, 2, 0.15);
    }

    /* Container reset */
    #view {
        background: var(--bg-primary) !important;
        min-height: 100vh;
        padding: 0 !important;
    }

    .nym-container {
        background: var(--bg-primary);
        color: var(--text-primary);
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
        padding: 24px;
        max-width: 900px;
        margin: 0 auto;
    }

    /* ─────────────────────────────────────────────────────────────────
       Header
       ───────────────────────────────────────────────────────────────── */

    .nym-header {
        text-align: center;
        padding: 32px 0 40px;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 32px;
    }

    .nym-logo {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
    }

    .nym-logo svg {
        height: 40px;
        width: auto;
        fill: var(--nym-green);
    }

    .nym-subtitle {
        color: var(--text-muted);
        font-size: 13px;
        margin-top: 12px;
        font-weight: 400;
    }

    /* ─────────────────────────────────────────────────────────────────
       Status Hero Section
       ───────────────────────────────────────────────────────────────── */

    .nym-status-hero {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 48px 32px;
        text-align: center;
        margin-bottom: 24px;
        position: relative;
        overflow: hidden;
    }

    .nym-status-hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--nym-green), transparent);
        opacity: 0;
        transition: opacity 0.5s;
    }

    .nym-status-hero.connected::before {
        opacity: 1;
    }

    /* Status Ring */
    .nym-status-ring {
        width: 160px;
        height: 160px;
        margin: 0 auto 32px;
        position: relative;
    }

    .nym-status-ring-outer {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid var(--border-color);
        position: absolute;
        top: 0;
        left: 0;
        transition: all 0.5s ease;
    }

    .nym-status-ring-inner {
        width: 140px;
        height: 140px;
        border-radius: 50%;
        background: var(--bg-secondary);
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: all 0.5s ease;
    }

    .nym-status-ring-pulse {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        position: absolute;
        top: 0;
        left: 0;
        border: 2px solid transparent;
        animation: none;
    }

    /* Connected state */
    .nym-status-hero.connected .nym-status-ring-outer {
        border-color: var(--nym-green);
        box-shadow: 0 0 30px var(--nym-green-glow), inset 0 0 20px var(--nym-green-dim);
    }

    .nym-status-hero.connected .nym-status-ring-pulse {
        border-color: var(--nym-green);
        animation: pulse-ring 2s ease-out infinite;
    }

    .nym-status-hero.connected .nym-status-ring-inner {
        background: var(--nym-green-dim);
    }

    /* Connecting state */
    .nym-status-hero.connecting .nym-status-ring-outer,
    .nym-status-hero.disconnecting .nym-status-ring-outer {
        border-color: var(--warning);
        border-width: 3px;
        animation: rotate-ring 4s linear infinite;
        border-style: dashed;
    }

    .nym-status-hero.connecting .nym-status-ring-inner,
    .nym-status-hero.disconnecting .nym-status-ring-inner {
        background: var(--warning-dim);
    }

    /* Disconnected state */
    .nym-status-hero.disconnected .nym-status-ring-outer {
        border-color: var(--text-muted);
    }

    @keyframes pulse-ring {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(1.3);
            opacity: 0;
        }
    }

    @keyframes rotate-ring {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .nym-status-label {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 2px;
        color: var(--text-secondary);
        font-weight: 500;
        text-align: center;
    }

    .nym-status-hero.connected .nym-status-label {
        color: var(--nym-green);
    }

    .nym-status-hero.connecting .nym-status-label,
    .nym-status-hero.disconnecting .nym-status-label {
        color: var(--warning);
    }

    /* Uptime display */
    .nym-uptime {
        font-size: 28px;
        font-weight: 300;
        color: var(--text-primary);
        margin-bottom: 8px;
        font-variant-numeric: tabular-nums;
    }

    .nym-uptime-label {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    /* Gateway info in hero */
    .nym-gateway-display {
        display: flex;
        justify-content: center;
        gap: 48px;
        margin-top: 32px;
        padding-top: 24px;
        border-top: 1px solid var(--border-color);
    }

    .nym-gateway-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 120px;
    }

    .nym-gateway-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
        text-indent: 2px;
        color: var(--text-muted);
        margin-bottom: 8px;
        text-align: center;
    }

    .nym-gateway-value {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .nym-gateway-flag {
        font-size: 28px;
        line-height: 1;
        min-width: 36px;
        text-align: center;
    }

    .nym-gateway-name {
        font-size: 12px;
        color: var(--text-primary);
        max-width: 140px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .nym-gateway-ip {
        font-size: 10px;
        color: var(--text-muted);
        font-family: monospace;
    }

    .nym-gateway-empty {
        font-size: 24px;
        color: var(--text-muted);
    }

    /* Connect/Disconnect buttons */
    .nym-action-buttons {
        display: flex;
        justify-content: center;
        gap: 16px;
        margin-top: 32px;
    }

    .nym-btn {
        padding: 14px 40px;
        font-size: 13px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 2px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-family: inherit;
    }

    .nym-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }

    .nym-btn-primary {
        background: var(--nym-green);
        color: var(--bg-primary);
    }

    .nym-btn-primary:hover:not(:disabled) {
        background: #00e085;
        box-shadow: 0 0 24px var(--nym-green-glow);
        transform: translateY(-1px);
    }

    .nym-btn-primary:active:not(:disabled) {
        transform: translateY(0);
    }

    .nym-btn-danger {
        background: transparent;
        color: var(--danger);
        border: 1px solid var(--danger);
    }

    .nym-btn-danger:hover:not(:disabled) {
        background: var(--danger-dim);
    }

    .nym-btn-secondary {
        background: transparent;
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
    }

    .nym-btn-secondary:hover:not(:disabled) {
        border-color: var(--text-secondary);
        color: var(--text-primary);
    }

    .nym-btn-small {
        padding: 8px 16px;
        font-size: 11px;
    }

    /* ─────────────────────────────────────────────────────────────────
       Cards & Sections
       ───────────────────────────────────────────────────────────────── */

    .nym-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        margin-bottom: 16px;
        overflow: hidden;
    }

    .nym-card-header {
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        transition: background 0.2s;
        user-select: none;
    }

    .nym-card-header:hover {
        background: var(--bg-card-hover);
    }

    .nym-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .nym-card-icon {
        width: 32px;
        height: 32px;
        background: var(--nym-green-dim);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
    }

    .nym-card-chevron {
        color: var(--text-muted);
        transition: transform 0.3s ease;
        font-size: 12px;
    }

    .nym-card.expanded .nym-card-chevron {
        transform: rotate(180deg);
    }

    .nym-card-body {
        padding: 0 20px 20px;
        display: none;
    }

    .nym-card.expanded .nym-card-body {
        display: block;
        animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* ─────────────────────────────────────────────────────────────────
       Custom Modal
       ───────────────────────────────────────────────────────────────── */

    .nym-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
    }

    .nym-modal {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        max-width: 320px;
        width: 90%;
    }

    .nym-modal-ring {
        width: 120px;
        height: 120px;
        margin: 0 auto 24px;
        position: relative;
    }

    .nym-modal-ring-outer {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 3px dashed var(--warning);
        animation: rotate-ring 2s linear infinite;
        position: absolute;
    }

    .nym-modal-ring-inner {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: var(--warning-dim);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .nym-modal-icon {
        font-size: 32px;
    }

    .nym-modal-title {
        color: var(--text-primary);
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
    }

    .nym-modal-message {
        color: var(--text-muted);
        font-size: 13px;
    }

    /* ─────────────────────────────────────────────────────────────────
       Toast Notifications
       ───────────────────────────────────────────────────────────────── */

    .nym-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 360px;
    }

    .nym-toast {
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }

    .nym-toast.success {
        border-left: 3px solid var(--nym-green);
    }

    .nym-toast.error {
        border-left: 3px solid var(--danger);
    }

    .nym-toast.warning {
        border-left: 3px solid var(--warning);
    }

    .nym-toast-icon {
        font-size: 18px;
        flex-shrink: 0;
    }

    .nym-toast.success .nym-toast-icon { color: var(--nym-green); }
    .nym-toast.error .nym-toast-icon { color: var(--danger); }
    .nym-toast.warning .nym-toast-icon { color: var(--warning); }

    .nym-toast-message {
        color: var(--text-primary);
        font-size: 13px;
        flex: 1;
    }

    .nym-toast-close {
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 4px;
        font-size: 16px;
    }

    .nym-toast-close:hover {
        color: var(--text-primary);
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }

    .nym-card-description {
        color: var(--text-muted);
        font-size: 12px;
        margin-bottom: 20px;
        line-height: 1.6;
    }

    /* ─────────────────────────────────────────────────────────────────
       Form Elements
       ───────────────────────────────────────────────────────────────── */

    .nym-form-group {
        margin-bottom: 20px;
    }

    .nym-form-label {
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-secondary);
        margin-bottom: 8px;
    }

    .nym-select {
        width: 100%;
        padding: 12px 16px;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 14px;
        font-family: inherit;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23606070' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 16px center;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .nym-select:hover {
        border-color: var(--border-accent);
    }

    .nym-select:focus {
        outline: none;
        border-color: var(--nym-green);
        box-shadow: 0 0 0 3px var(--nym-green-dim);
    }

    .nym-input {
        width: 100%;
        padding: 12px 16px;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 14px;
        font-family: inherit;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .nym-input::placeholder {
        color: var(--text-muted);
    }

    .nym-input:focus {
        outline: none;
        border-color: var(--nym-green);
        box-shadow: 0 0 0 3px var(--nym-green-dim);
    }

    /* Toggle Switch */
    .nym-toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 0;
        border-bottom: 1px solid var(--border-color);
    }

    .nym-toggle-row:last-child {
        border-bottom: none;
    }

    .nym-toggle-info {
        flex: 1;
    }

    .nym-toggle-title {
        font-size: 14px;
        color: var(--text-primary);
        margin-bottom: 4px;
    }

    .nym-toggle-desc {
        font-size: 12px;
        color: var(--text-muted);
    }

    .nym-toggle {
        position: relative;
        width: 48px;
        height: 26px;
        flex-shrink: 0;
        margin-left: 16px;
    }

    .nym-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .nym-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 26px;
        transition: all 0.3s ease;
    }

    .nym-toggle-slider::before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background: var(--text-muted);
        border-radius: 50%;
        transition: all 0.3s ease;
    }

    .nym-toggle input:checked + .nym-toggle-slider {
        background: var(--nym-green-dim);
        border-color: var(--nym-green);
    }

    .nym-toggle input:checked + .nym-toggle-slider::before {
        transform: translateX(22px);
        background: var(--nym-green);
    }

    /* ─────────────────────────────────────────────────────────────────
       Gateway Selection Grid
       ───────────────────────────────────────────────────────────────── */

    .nym-gateway-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    @media (max-width: 600px) {
        .nym-gateway-section {
            grid-template-columns: 1fr;
        }
    }

    .nym-gateway-box {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
    }

    .nym-gateway-box-title {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--nym-green);
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .nym-gateway-box-title::before {
        content: '';
        width: 6px;
        height: 6px;
        background: var(--nym-green);
        border-radius: 50%;
    }

    .nym-gateway-loading {
        color: var(--text-muted);
        font-size: 13px;
        font-style: italic;
        padding: 12px 0;
    }

    .nym-gateway-option {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        margin-bottom: 6px;
        cursor: pointer;
        transition: all 0.2s;
    }

    .nym-gateway-option:hover {
        border-color: var(--nym-green);
        background: var(--bg-card-hover);
    }

    .nym-gateway-option.selected {
        border-color: var(--nym-green);
        background: var(--nym-green-dim);
    }

    .nym-gateway-option input[type="radio"] {
        display: none;
    }

    .nym-gateway-option-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
    }

    .nym-gateway-option-icon svg {
        width: 100%;
        height: 100%;
    }

    .nym-gateway-option-info {
        flex: 1;
        min-width: 0;
    }

    .nym-gateway-option-name {
        font-size: 13px;
        color: var(--text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .nym-gateway-option-perf {
        font-size: 11px;
        color: var(--text-muted);
    }

    .nym-gateway-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .nym-gateway-list::-webkit-scrollbar {
        width: 4px;
    }

    .nym-gateway-list::-webkit-scrollbar-track {
        background: var(--bg-input);
    }

    .nym-gateway-list::-webkit-scrollbar-thumb {
        background: var(--border-accent);
        border-radius: 2px;
    }

    /* ─────────────────────────────────────────────────────────────────
       Info Grid
       ───────────────────────────────────────────────────────────────── */

    .nym-info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
    }

    @media (max-width: 500px) {
        .nym-info-grid {
            grid-template-columns: 1fr;
        }
    }

    .nym-info-item {
        background: var(--bg-secondary);
        padding: 12px 16px;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }

    .nym-info-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--text-muted);
        margin-bottom: 4px;
    }

    .nym-info-value {
        font-size: 14px;
        color: var(--text-primary);
        word-break: break-all;
    }

    .nym-info-value.truncate {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* ─────────────────────────────────────────────────────────────────
       Account Section
       ───────────────────────────────────────────────────────────────── */

    .nym-account-logged-in {
        text-align: center;
        padding: 20px 0;
    }

    .nym-account-id {
        background: var(--bg-input);
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 12px;
        color: var(--text-secondary);
        word-break: break-all;
        margin-bottom: 16px;
        border: 1px solid var(--border-color);
    }

    .nym-account-state {
        display: inline-block;
        padding: 6px 12px;
        background: var(--nym-green-dim);
        color: var(--nym-green);
        border-radius: 20px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 20px;
    }

    .nym-account-actions {
        display: flex;
        justify-content: center;
        gap: 12px;
    }

    /* ─────────────────────────────────────────────────────────────────
       Footer Info
       ───────────────────────────────────────────────────────────────── */

    .nym-footer {
        text-align: center;
        padding: 24px 0;
        border-top: 1px solid var(--border-color);
        margin-top: 24px;
    }

    .nym-footer-info {
        display: flex;
        justify-content: center;
        gap: 32px;
        font-size: 12px;
        color: var(--text-muted);
    }

    .nym-footer-item span {
        color: var(--text-secondary);
    }

    /* ─────────────────────────────────────────────────────────────────
       Tooltip
       ───────────────────────────────────────────────────────────────── */

    .nym-tooltip {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        background: var(--border-color);
        border-radius: 50%;
        font-size: 10px;
        color: var(--text-muted);
        cursor: help;
        margin-left: 8px;
    }

    .nym-tooltip::after {
        content: attr(data-tip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 12px;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        font-size: 11px;
        color: var(--text-secondary);
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s;
        z-index: 100;
        margin-bottom: 8px;
    }

    .nym-tooltip:hover::after {
        opacity: 1;
        visibility: visible;
    }

    /* ─────────────────────────────────────────────────────────────────
       Utility
       ───────────────────────────────────────────────────────────────── */

    .nym-divider {
        height: 1px;
        background: var(--border-color);
        margin: 20px 0;
    }

    .nym-text-center {
        text-align: center;
    }

    .nym-text-muted {
        color: var(--text-muted);
    }

    .nym-mt-16 {
        margin-top: 16px;
    }

    .nym-mb-16 {
        margin-bottom: 16px;
    }

    /* Hide LuCI default styles */
    .cbi-map > h2,
    .cbi-map > .cbi-map-descr {
        display: none !important;
    }
`;

return view.extend({
    load: function() {
        return Promise.all([
            callStatus(),
            callInfo(),
            callGatewayGet(),
            callGatewayListCountries('mixnet-entry'),
            callGatewayListCountries('mixnet-exit'),
            callTunnelGet(),
            callAccountGet(),
            callNetworkGet(),
            callLanGet()
        ]).catch(function(err) {
            showToast('Failed to load Nym VPN data: ' + err.message, 'error');
            return [null, null, null, [], [], null, null, null, null];
        });
    },

    render: function(data) {
        var status = data[0] || {};
        var info = data[1] || {};
        var gateway_config = data[2] || {};
        var entry_countries = (data[3] && data[3].countries) || [];
        var exit_countries = (data[4] && data[4].countries) || [];
        var tunnel_config = data[5] || {};
        var account_info = data[6] || {};
        var network = data[7] || {};
        var lan_policy = data[8] || {};

        var view = this;

        // State references
        var statusHero, statusLabel, uptimeDisplay;
        var actionBtn;
        var entryGatewayDisplay, exitGatewayDisplay;
        var entryCountrySelect, exitCountrySelect;
        var entryGatewayContainer, exitGatewayContainer;

        // Uptime tracking
        var connectionStartTime = null;
        var uptimeInterval = null;
        var UPTIME_STORAGE_KEY = 'nym_vpn_connection_start';

        var formatUptime = function(seconds) {
            var hours = Math.floor(seconds / 3600);
            var minutes = Math.floor((seconds % 3600) / 60);
            var secs = seconds % 60;

            var pad = function(n) { return n < 10 ? '0' + n : n; };

            if (hours > 0) {
                return pad(hours) + ':' + pad(minutes) + ':' + pad(secs);
            } else {
                return pad(minutes) + ':' + pad(secs);
            }
        };

        var startUptimeTimer = function(existingStartTime) {
            if (uptimeInterval) clearInterval(uptimeInterval);

            connectionStartTime = existingStartTime || Date.now();

            // Always save to localStorage to ensure persistence
            try {
                localStorage.setItem(UPTIME_STORAGE_KEY, connectionStartTime.toString());
            } catch (e) {}

            // Immediately show current elapsed time
            var updateDisplay = function() {
                if (uptimeDisplay && connectionStartTime) {
                    var elapsed = Math.floor((Date.now() - connectionStartTime) / 1000);
                    uptimeDisplay.textContent = formatUptime(elapsed);
                }
            };

            updateDisplay();
            uptimeInterval = setInterval(updateDisplay, 1000);
        };

        var stopUptimeTimer = function() {
            if (uptimeInterval) {
                clearInterval(uptimeInterval);
                uptimeInterval = null;
            }
            connectionStartTime = null;
            try { localStorage.removeItem(UPTIME_STORAGE_KEY); } catch (e) {}
            if (uptimeDisplay) uptimeDisplay.textContent = '--:--';
        };

        var getStoredStartTime = function() {
            try {
                var stored = localStorage.getItem(UPTIME_STORAGE_KEY);
                return stored ? parseInt(stored, 10) : null;
            } catch (e) { return null; }
        };

        // Get country display with flag
        var getCountryDisplay = function(code) {
            if (!code || code === 'random' || code === 'Random') {
                return { flag: '🌐', name: 'Random' };
            }
            return countryData[code] || { flag: '🏳️', name: code };
        };

        // Update status display
        var updateStatus = function() {
            return callStatus().then(function(result) {
                if (!result) return;

                var state = result.state || 'unknown';

                // Update hero class
                if (statusHero) {
                    statusHero.className = 'nym-status-hero ' + state;
                }

                // Update label
                if (statusLabel) {
                    if (state === 'connected') {
                        statusLabel.textContent = 'Connected';
                        if (!connectionStartTime) {
                            startUptimeTimer(getStoredStartTime());
                        }
                    } else if (state === 'connecting') {
                        statusLabel.textContent = 'Connecting';
                        stopUptimeTimer();
                    } else if (state === 'disconnecting') {
                        statusLabel.textContent = 'Disconnecting';
                    } else {
                        statusLabel.textContent = 'Disconnected';
                        stopUptimeTimer();
                    }
                }

                // Update buttons
                if (actionBtn) {
                    if (state === 'connected') {
                        actionBtn.textContent = 'Disconnect';
                        actionBtn.className = 'nym-btn nym-btn-danger';
                        actionBtn.disabled = false;
                        actionBtn.onclick = handleDisconnect;
                    } else if (state === 'disconnected') {
                        actionBtn.textContent = 'Connect';
                        actionBtn.className = 'nym-btn nym-btn-primary';
                        actionBtn.disabled = false;
                        actionBtn.onclick = handleConnect;
                    } else {
                        actionBtn.disabled = true;
                    }
                }

                // Update gateway display with actual connected node names
                var renderGatewayInfo = function(container, name, ip, country) {
                    if (!container) return;
                    if (!name && !ip) {
                        container.innerHTML = '<div class="nym-gateway-empty">—</div>';
                        return;
                    }
                    var flag = country ? (countryData[country] || {}).flag || '🌐' : '🌐';
                    var html = '<div class="nym-gateway-flag">' + flag + '</div>';
                    if (name) html += '<div class="nym-gateway-name" title="' + (name || '') + '">' + name + '</div>';
                    if (ip) html += '<div class="nym-gateway-ip">' + ip + '</div>';
                    container.innerHTML = html;
                };

                if (state === 'connected') {
                    renderGatewayInfo(entryGatewayDisplay,
                        result.entry_name || result.entry_id,
                        result.entry_ip,
                        result.entry_country);
                    renderGatewayInfo(exitGatewayDisplay,
                        result.exit_name || result.exit_id,
                        result.exit_ip,
                        result.exit_country);
                } else {
                    if (entryGatewayDisplay) entryGatewayDisplay.innerHTML = '<div class="nym-gateway-empty">—</div>';
                    if (exitGatewayDisplay) exitGatewayDisplay.innerHTML = '<div class="nym-gateway-empty">—</div>';
                }

            }).catch(function(err) {
                console.error('Status update failed:', err);
            });
        };

        // Custom modal helpers
        var activeModal = null;

        var showModal = function(title, message, icon) {
            hideModal();
            activeModal = E('div', { 'class': 'nym-modal-overlay' }, [
                E('div', { 'class': 'nym-modal' }, [
                    E('div', { 'class': 'nym-modal-ring' }, [
                        E('div', { 'class': 'nym-modal-ring-outer' }),
                        E('div', { 'class': 'nym-modal-ring-inner' }, [
                            E('div', { 'class': 'nym-modal-icon' }, icon || '◐')
                        ])
                    ]),
                    E('div', { 'class': 'nym-modal-title' }, title),
                    E('div', { 'class': 'nym-modal-message' }, message)
                ])
            ]);
            document.body.appendChild(activeModal);
        };

        var hideModal = function() {
            if (activeModal && activeModal.parentNode) {
                activeModal.parentNode.removeChild(activeModal);
                activeModal = null;
            }
        };

        // Toast notification helpers
        var toastContainer = null;

        var ensureToastContainer = function() {
            if (!toastContainer || !toastContainer.parentNode) {
                toastContainer = E('div', { 'class': 'nym-toast-container' });
                document.body.appendChild(toastContainer);
            }
            return toastContainer;
        };

        var showToast = function(message, type) {
            var container = ensureToastContainer();
            var icons = { success: '✓', error: '✕', warning: '⚠' };
            var toast = E('div', { 'class': 'nym-toast ' + (type || 'success') }, [
                E('span', { 'class': 'nym-toast-icon' }, icons[type] || '✓'),
                E('span', { 'class': 'nym-toast-message' }, message),
                E('button', { 'class': 'nym-toast-close', 'click': function() { removeToast(toast); } }, '×')
            ]);
            container.appendChild(toast);
            setTimeout(function() { removeToast(toast); }, 4000);
        };

        var removeToast = function(toast) {
            if (toast && toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease forwards';
                setTimeout(function() {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                }, 300);
            }
        };

        // Connection handlers
        var handleConnect = function() {
            // Set connecting state immediately to show animation
            if (statusHero) statusHero.className = 'nym-status-hero connecting';
            if (statusLabel) statusLabel.textContent = 'Connecting';
            if (actionBtn) actionBtn.disabled = true;

            callConnect().then(function(result) {
                if (!result || !result.success) {
                    showToast('Connection failed: ' + (result.error || 'Unknown error'), 'error');
                    updateStatus();
                    return;
                }

                var pollCount = 0;
                var maxPolls = 60;

                var pollStatus = function() {
                    pollCount++;
                    callStatus().then(function(st) {
                        if (st && st.state === 'connected') {
                            updateStatus();
                        } else if (st && st.state === 'connecting') {
                            if (pollCount < maxPolls) {
                                setTimeout(pollStatus, 1000);
                            } else {
                                updateStatus();
                            }
                        } else {
                            updateStatus();
                        }
                    }).catch(function() {
                        if (pollCount < maxPolls) setTimeout(pollStatus, 1000);
                        else updateStatus();
                    });
                };

                setTimeout(pollStatus, 1000);
            }).catch(function(err) {
                showToast('Connection error: ' + err.message, 'error');
                updateStatus();
            });
        };

        var handleDisconnect = function() {
            // Set disconnecting state immediately to show animation
            if (statusHero) statusHero.className = 'nym-status-hero disconnecting';
            if (statusLabel) statusLabel.textContent = 'Disconnecting';
            if (actionBtn) actionBtn.disabled = true;

            callDisconnect().then(function(result) {
                if (result && result.success) {
                    updateStatus();
                } else {
                    showToast('Disconnect failed: ' + (result.error || 'Unknown'), 'error');
                    updateStatus();
                }
            }).catch(function(err) {
                showToast('Disconnect error: ' + err.message, 'error');
                updateStatus();
            });
        };

        // Toggle card expand/collapse
        var toggleCard = function(card) {
            card.classList.toggle('expanded');
        };

        // Get quality indicator SVG based on performance
        var getQualityIcon = function(performance) {
            var perf = (performance || '').toLowerCase();
            if (perf.indexOf('high') >= 0) return svgAssets.qualityHigh;
            if (perf.indexOf('medium') >= 0) return svgAssets.qualityMedium;
            if (perf.indexOf('offline') >= 0) return svgAssets.qualityOffline;
            return svgAssets.qualityLow;
        };

        // Load gateways for selected country
        var loadGatewaysForCountry = function(country, type, container) {
            if (!country || country === 'none') {
                dom.content(container, E('div', { 'class': 'nym-gateway-loading' }, 'Select a country above'));
                return;
            }

            if (country === 'random') {
                dom.content(container, E('div', { 'class': 'nym-gateway-loading' }, '🌐 Random gateway will be selected'));
                return;
            }

            dom.content(container, E('div', { 'class': 'nym-gateway-loading' }, 'Loading gateways...'));

            callGatewayListByCountry(type, country).then(function(result) {
                if (!result || !result.gateways || result.gateways.length === 0) {
                    dom.content(container, E('div', { 'class': 'nym-gateway-loading' }, 'No gateways available'));
                    return;
                }

                var sorted = result.gateways.slice().sort(function(a, b) {
                    var scoreA = (a.performance || '').indexOf('High') >= 0 ? 3 :
                                 (a.performance || '').indexOf('Medium') >= 0 ? 2 :
                                 (a.performance || '').indexOf('Offline') >= 0 ? 0 : 1;
                    var scoreB = (b.performance || '').indexOf('High') >= 0 ? 3 :
                                 (b.performance || '').indexOf('Medium') >= 0 ? 2 :
                                 (b.performance || '').indexOf('Offline') >= 0 ? 0 : 1;
                    return scoreB - scoreA;
                });

                var inputName = type === 'mixnet-entry' ? 'entry_gateway_id' : 'exit_gateway_id';
                var gatewayList = E('div', { 'class': 'nym-gateway-list' });

                // Add "Any (Random)" option first
                var randomOption = E('label', { 'class': 'nym-gateway-option selected' }, [
                    E('input', { 'type': 'radio', 'name': inputName, 'value': '', 'checked': 'checked' }),
                    E('div', { 'class': 'nym-gateway-option-info' }, [
                        E('div', { 'class': 'nym-gateway-option-name' }, '🎲 Any Gateway (Random)')
                    ])
                ]);
                randomOption.addEventListener('click', function() {
                    container.querySelectorAll('.nym-gateway-option').forEach(function(el) {
                        el.classList.remove('selected');
                    });
                    randomOption.classList.add('selected');
                });
                gatewayList.appendChild(randomOption);

                // Add gateway options
                sorted.forEach(function(gw) {
                    var perf = gw.performance || 'Unknown';
                    var iconDiv = E('div', { 'class': 'nym-gateway-option-icon' });
                    iconDiv.innerHTML = getQualityIcon(perf);

                    var option = E('label', { 'class': 'nym-gateway-option' }, [
                        E('input', { 'type': 'radio', 'name': inputName, 'value': gw.id || '' }),
                        iconDiv,
                        E('div', { 'class': 'nym-gateway-option-info' }, [
                            E('div', { 'class': 'nym-gateway-option-name' }, gw.name || 'Unknown'),
                            E('div', { 'class': 'nym-gateway-option-perf' }, perf)
                        ])
                    ]);
                    option.addEventListener('click', function() {
                        container.querySelectorAll('.nym-gateway-option').forEach(function(el) {
                            el.classList.remove('selected');
                        });
                        option.classList.add('selected');
                    });
                    gatewayList.appendChild(option);
                });

                dom.content(container, [
                    E('label', { 'class': 'nym-form-label' }, 'Gateway'),
                    gatewayList,
                    E('div', { 'style': 'font-size: 11px; color: var(--text-muted); margin-top: 8px' },
                        result.gateways.length + ' gateways available')
                ]);
            }).catch(function(err) {
                dom.content(container, E('div', { 'class': 'nym-gateway-loading', 'style': 'color: var(--danger)' },
                    'Error: ' + err.message));
            });
        };

        // Create country select
        var createCountrySelect = function(countries, name, onSelect) {
            var options = [E('option', { 'value': 'none' }, '— Select Country —')];
            options.push(E('option', { 'value': 'random' }, '🌐 Random'));

            countries.forEach(function(c) {
                var info = getCountryDisplay(c.code);
                options.push(E('option', { 'value': c.code },
                    info.flag + ' ' + info.name + ' (' + c.count + ')'));
            });

            return E('select', {
                'class': 'nym-select',
                'name': name,
                'change': onSelect
            }, options);
        };

        // Gateway update handler
        var handleGatewayUpdate = function(ev) {
            ev.preventDefault();
            var form = ev.target;
            var fd = new FormData(form);

            var entry_country = fd.get('entry_country');
            var exit_country = fd.get('exit_country');
            var entry_id = fd.get('entry_gateway_id');
            var exit_id = fd.get('exit_gateway_id');
            var residential = fd.get('residential_exit');

            var entry_random = false;
            var exit_random = false;

            if (entry_country === 'none') entry_country = null;
            if (exit_country === 'none') exit_country = null;
            if (entry_country === 'random') { entry_country = null; entry_id = null; entry_random = true; }
            if (exit_country === 'random') { exit_country = null; exit_id = null; exit_random = true; }
            if (entry_id) entry_country = null;
            if (exit_id) exit_country = null;

            callGatewaySet(entry_country, exit_country, entry_id || null, exit_id || null, entry_random, exit_random, residential || null)
                .then(function(result) {
                    if (result && result.success) {
                        showToast('Gateway configuration saved', 'success');
                    } else {
                        showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                    }
                }).catch(function(err) {
                    showToast('Error: ' + err.message, 'error');
                });
        };

        // Tunnel update handler
        var handleTunnelUpdate = function(ev) {
            ev.preventDefault();
            var ipv6 = ev.target.querySelector('#ipv6-toggle').checked ? 'on' : 'off';
            var two_hop = ev.target.querySelector('#two-hop-toggle').checked ? 'on' : 'off';

            callTunnelSet(ipv6, two_hop).then(function(result) {
                if (result && result.success) {
                    showToast('Tunnel settings saved', 'success');
                } else {
                    showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                }
            }).catch(function(err) {
                showToast('Error: ' + err.message, 'error');
            });
        };

        // Account handlers
        var handleAccountLogin = function(ev) {
            ev.preventDefault();
            var fd = new FormData(ev.target);
            var mnemonic = fd.get('mnemonic');
            var mode = fd.get('mode') || 'api';

            if (!mnemonic) {
                showToast('Recovery phrase is required', 'error');
                return;
            }

            callAccountSet(mnemonic, mode).then(function(result) {
                if (result && result.success) {
                    showToast('Account configured', 'success');
                    setTimeout(function() { location.reload(); }, 1000);
                } else {
                    showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                }
            }).catch(function(err) {
                showToast('Error: ' + err.message, 'error');
            });
        };

        var handleAccountLogout = function() {
            callAccountForget().then(function(result) {
                if (result && result.success) {
                    showToast('Account removed', 'success');
                    setTimeout(function() { location.reload(); }, 1000);
                } else {
                    showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                }
            }).catch(function(err) {
                showToast('Error: ' + err.message, 'error');
            });
        };

        var handleRotateKeys = function() {
            callStatus().then(function(st) {
                if (st && (st.state === 'connected' || st.state === 'connecting')) {
                    showToast('Please disconnect before rotating keys', 'warning');
                    return;
                }

                showModal('Rotating Keys', 'Generating new keys...', '🔑');
                callAccountRotateKeys().then(function(result) {
                    hideModal();
                    if (result && result.success) {
                        showToast('Keys rotated successfully', 'success');
                    } else {
                        showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                    }
                }).catch(function(err) {
                    hideModal();
                    showToast('Error: ' + err.message, 'error');
                });
            });
        };

        // LAN policy handler
        var handleLanPolicy = function(policy) {
            callLanSet(policy).then(function(result) {
                if (result && result.success) {
                    showToast('LAN policy set to: ' + policy, 'success');
                    var display = document.getElementById('lan-policy-display');
                    if (display) display.textContent = policy;
                } else {
                    showToast('Failed: ' + (result.error || 'Unknown'), 'error');
                }
            }).catch(function(err) {
                showToast('Error: ' + err.message, 'error');
            });
        };

        // Check if logged in
        var identity = account_info.identity || '';
        var state = account_info.state || '';
        var invalidIdentities = ['', 'Not set', 'LoggedOut', 'unset', 'none'];
        var hasError = state.indexOf('Error') >= 0 || identity.indexOf('Error') >= 0;
        var isLoggedIn = identity && invalidIdentities.indexOf(identity) === -1 && !hasError;

        // ═══════════════════════════════════════════════════════════════
        // BUILD UI
        // ═══════════════════════════════════════════════════════════════

        var container = E('div', { 'class': 'nym-container' }, [
            E('style', {}, themeCSS),

            // Header
            (function() {
                var header = E('div', { 'class': 'nym-header' });
                var logoDiv = E('div', { 'class': 'nym-logo' });
                logoDiv.innerHTML = svgAssets.logo;
                header.appendChild(logoDiv);
                header.appendChild(E('div', { 'class': 'nym-subtitle' }, 'The world\'s most private VPN'));
                return header;
            })(),

            // Status Hero
            statusHero = E('div', { 'class': 'nym-status-hero disconnected' }, [
                E('div', { 'class': 'nym-status-ring' }, [
                    E('div', { 'class': 'nym-status-ring-pulse' }),
                    E('div', { 'class': 'nym-status-ring-outer' }),
                    E('div', { 'class': 'nym-status-ring-inner' }, [
                        statusLabel = E('div', { 'class': 'nym-status-label' }, 'Disconnected')
                    ])
                ]),
                E('div', { 'class': 'nym-uptime' }, [
                    uptimeDisplay = E('span', {}, '--:--')
                ]),
                E('div', { 'class': 'nym-uptime-label' }, 'Session Duration'),
                E('div', { 'class': 'nym-gateway-display' }, [
                    E('div', { 'class': 'nym-gateway-item' }, [
                        E('div', { 'class': 'nym-gateway-label' }, 'Entry'),
                        entryGatewayDisplay = E('div', { 'class': 'nym-gateway-value' }, [
                            E('div', { 'class': 'nym-gateway-empty' }, '—')
                        ])
                    ]),
                    E('div', { 'class': 'nym-gateway-item' }, [
                        E('div', { 'class': 'nym-gateway-label' }, 'Exit'),
                        exitGatewayDisplay = E('div', { 'class': 'nym-gateway-value' }, [
                            E('div', { 'class': 'nym-gateway-empty' }, '—')
                        ])
                    ])
                ]),
                E('div', { 'class': 'nym-action-buttons' }, [
                    actionBtn = E('button', {
                        'class': 'nym-btn nym-btn-primary',
                        'click': handleConnect
                    }, 'Connect')
                ])
            ])
        ]);

        // Gateway Selection Card
        entryGatewayContainer = E('div', { 'class': 'nym-form-group' },
            E('div', { 'class': 'nym-gateway-loading' }, 'Select a country above'));
        exitGatewayContainer = E('div', { 'class': 'nym-form-group' },
            E('div', { 'class': 'nym-gateway-loading' }, 'Select a country above'));

        var gatewayCard = E('div', { 'class': 'nym-card' }, [
            E('div', { 'class': 'nym-card-header', 'click': function() { toggleCard(gatewayCard); } }, [
                E('div', { 'class': 'nym-card-title' }, [
                    E('div', { 'class': 'nym-card-icon' }, '⬡'),
                    'Gateway Selection'
                ]),
                E('div', { 'class': 'nym-card-chevron' }, '▼')
            ]),
            E('div', { 'class': 'nym-card-body' }, [
                E('div', { 'class': 'nym-card-description' },
                    'Choose your entry and exit points in the Nym mixnet. Entry is where your traffic enters, exit is where it emerges.'),
                E('form', { 'submit': handleGatewayUpdate }, [
                    E('div', { 'class': 'nym-gateway-section' }, [
                        E('div', { 'class': 'nym-gateway-box' }, [
                            E('div', { 'class': 'nym-gateway-box-title' }, 'Entry Point'),
                            E('div', { 'class': 'nym-form-group' }, [
                                E('label', { 'class': 'nym-form-label' }, 'Country'),
                                entryCountrySelect = createCountrySelect(entry_countries, 'entry_country', function(ev) {
                                    loadGatewaysForCountry(ev.target.value, 'mixnet-entry', entryGatewayContainer);
                                })
                            ]),
                            entryGatewayContainer
                        ]),
                        E('div', { 'class': 'nym-gateway-box' }, [
                            E('div', { 'class': 'nym-gateway-box-title' }, 'Exit Point'),
                            E('div', { 'class': 'nym-form-group' }, [
                                E('label', { 'class': 'nym-form-label' }, 'Country'),
                                exitCountrySelect = createCountrySelect(exit_countries, 'exit_country', function(ev) {
                                    loadGatewaysForCountry(ev.target.value, 'mixnet-exit', exitGatewayContainer);
                                })
                            ]),
                            exitGatewayContainer
                        ])
                    ]),
                    E('div', { 'class': 'nym-form-group' }, [
                        E('label', { 'class': 'nym-form-label' }, 'Residential Exit'),
                        E('select', { 'class': 'nym-select', 'name': 'residential_exit' }, [
                            E('option', { 'value': '' }, '— No change —'),
                            E('option', { 'value': 'on' }, 'Enabled'),
                            E('option', { 'value': 'off' }, 'Disabled')
                        ])
                    ]),
                    E('button', { 'type': 'submit', 'class': 'nym-btn nym-btn-primary', 'style': 'width: 100%' },
                        'Save Gateway Settings')
                ])
            ])
        ]);

        // Tunnel Configuration Card
        var tunnelCard = E('div', { 'class': 'nym-card' }, [
            E('div', { 'class': 'nym-card-header', 'click': function() { toggleCard(tunnelCard); } }, [
                E('div', { 'class': 'nym-card-title' }, [
                    E('div', { 'class': 'nym-card-icon' }, '⚙'),
                    'Tunnel Settings'
                ]),
                E('div', { 'class': 'nym-card-chevron' }, '▼')
            ]),
            E('div', { 'class': 'nym-card-body' }, [
                E('div', { 'class': 'nym-card-description' },
                    'Configure how your traffic is routed through the mixnet.'),
                E('form', { 'submit': handleTunnelUpdate }, [
                    E('div', { 'class': 'nym-toggle-row' }, [
                        E('div', { 'class': 'nym-toggle-info' }, [
                            E('div', { 'class': 'nym-toggle-title' }, 'IPv6 Support'),
                            E('div', { 'class': 'nym-toggle-desc' }, 'Enable IPv6 addresses in the VPN tunnel')
                        ]),
                        E('label', { 'class': 'nym-toggle' }, [
                            E('input', {
                                'type': 'checkbox',
                                'id': 'ipv6-toggle',
                                'checked': (tunnel_config.ipv6 === 'on' || tunnel_config.ipv6 === 'true') ? 'checked' : null
                            }),
                            E('span', { 'class': 'nym-toggle-slider' })
                        ])
                    ]),
                    E('div', { 'class': 'nym-toggle-row' }, [
                        E('div', { 'class': 'nym-toggle-info' }, [
                            E('div', { 'class': 'nym-toggle-title' }, 'Two-Hop Mode (Fast)'),
                            E('div', { 'class': 'nym-toggle-desc' }, 'Use WireGuard with 2 hops instead of 5-hop mixnet. Faster but less private.')
                        ]),
                        E('label', { 'class': 'nym-toggle' }, [
                            E('input', {
                                'type': 'checkbox',
                                'id': 'two-hop-toggle',
                                'checked': (tunnel_config.two_hop === 'on' || tunnel_config.two_hop === 'true') ? 'checked' : null
                            }),
                            E('span', { 'class': 'nym-toggle-slider' })
                        ])
                    ]),
                    E('div', { 'class': 'nym-info-grid nym-mt-16' }, [
                        E('div', { 'class': 'nym-info-item' }, [
                            E('div', { 'class': 'nym-info-label' }, 'Netstack'),
                            E('div', { 'class': 'nym-info-value' }, tunnel_config.netstack || '—')
                        ]),
                        E('div', { 'class': 'nym-info-item' }, [
                            E('div', { 'class': 'nym-info-label' }, 'Transports'),
                            E('div', { 'class': 'nym-info-value' }, tunnel_config.circumvention_transports || '—')
                        ])
                    ]),
                    E('button', { 'type': 'submit', 'class': 'nym-btn nym-btn-primary nym-mt-16', 'style': 'width: 100%' },
                        'Save Tunnel Settings')
                ])
            ])
        ]);

        // LAN Access Card
        var lanCard = E('div', { 'class': 'nym-card' }, [
            E('div', { 'class': 'nym-card-header', 'click': function() { toggleCard(lanCard); } }, [
                E('div', { 'class': 'nym-card-title' }, [
                    E('div', { 'class': 'nym-card-icon' }, '🏠'),
                    'Local Network'
                ]),
                E('div', { 'class': 'nym-card-chevron' }, '▼')
            ]),
            E('div', { 'class': 'nym-card-body' }, [
                E('div', { 'class': 'nym-card-description' },
                    'Control whether devices on your local network can be accessed while connected to the VPN.'),
                E('div', { 'class': 'nym-info-item nym-mb-16' }, [
                    E('div', { 'class': 'nym-info-label' }, 'Current Policy'),
                    E('div', { 'class': 'nym-info-value', 'id': 'lan-policy-display' }, lan_policy.policy || '—')
                ]),
                E('div', { 'style': 'display: flex; gap: 12px' }, [
                    E('button', {
                        'class': 'nym-btn nym-btn-primary',
                        'style': 'flex: 1',
                        'click': function() { handleLanPolicy('allow'); }
                    }, 'Allow LAN'),
                    E('button', {
                        'class': 'nym-btn nym-btn-danger',
                        'style': 'flex: 1',
                        'click': function() { handleLanPolicy('block'); }
                    }, 'Block LAN')
                ])
            ])
        ]);

        // Account Card
        var accountCard = E('div', { 'class': 'nym-card' }, [
            E('div', { 'class': 'nym-card-header', 'click': function() { toggleCard(accountCard); } }, [
                E('div', { 'class': 'nym-card-title' }, [
                    E('div', { 'class': 'nym-card-icon' }, '👤'),
                    'Account'
                ]),
                E('div', { 'class': 'nym-card-chevron' }, '▼')
            ]),
            E('div', { 'class': 'nym-card-body' }, [
                isLoggedIn ? E('div', { 'class': 'nym-account-logged-in' }, [
                    E('div', { 'class': 'nym-account-state' }, account_info.state || 'Active'),
                    E('div', { 'class': 'nym-account-id' }, account_info.identity),
                    E('div', { 'class': 'nym-account-actions' }, [
                        E('button', { 'class': 'nym-btn nym-btn-secondary nym-btn-small', 'click': handleRotateKeys }, 'Rotate Keys'),
                        E('button', { 'class': 'nym-btn nym-btn-danger nym-btn-small', 'click': handleAccountLogout }, 'Logout')
                    ])
                ]) : hasError ? E('div', { 'class': 'nym-account-error' }, [
                    E('div', { 'class': 'nym-account-state', 'style': 'color: var(--danger)' }, state || 'Error'),
                    E('div', { 'class': 'nym-card-description', 'style': 'margin: 12px 0' },
                        'An account exists but there was an error. Try logging out and back in.'),
                    E('button', { 'class': 'nym-btn nym-btn-danger', 'style': 'width: 100%', 'click': handleAccountLogout }, 'Logout')
                ]) : E('form', { 'submit': handleAccountLogin }, [
                    E('div', { 'class': 'nym-card-description' },
                        'Enter your recovery phrase to connect your Nym account.'),
                    E('div', { 'class': 'nym-form-group' }, [
                        E('label', { 'class': 'nym-form-label' }, 'Recovery Phrase'),
                        E('input', {
                            'type': 'password',
                            'name': 'mnemonic',
                            'class': 'nym-input',
                            'placeholder': 'Enter your 24-word recovery phrase'
                        })
                    ]),
                    E('div', { 'class': 'nym-form-group' }, [
                        E('label', { 'class': 'nym-form-label' }, 'Connection Mode'),
                        E('select', { 'name': 'mode', 'class': 'nym-select' }, [
                            E('option', { 'value': 'api' }, 'API (Recommended)'),
                            E('option', { 'value': 'decentralised' }, 'Decentralised')
                        ])
                    ]),
                    E('button', { 'type': 'submit', 'class': 'nym-btn nym-btn-primary', 'style': 'width: 100%' }, 'Login')
                ])
            ])
        ]);

        // Footer
        var footer = E('div', { 'class': 'nym-footer' }, [
            E('div', { 'class': 'nym-footer-info' }, [
                E('div', { 'class': 'nym-footer-item' }, ['Version: ', E('span', {}, info.version || '—')]),
                E('div', { 'class': 'nym-footer-item' }, ['Network: ', E('span', {}, network.network || info.network || '—')])
            ])
        ]);

        // Append all cards
        container.appendChild(gatewayCard);
        container.appendChild(tunnelCard);
        container.appendChild(lanCard);
        container.appendChild(accountCard);
        container.appendChild(footer);

        // Initial status
        updateStatus();

        // Start uptime if connected
        if (status.state === 'connected') {
            var storedTime = getStoredStartTime();
            startUptimeTimer(storedTime);
        }

        // Poll status
        poll.add(updateStatus, 5);

        return container;
    },

    handleSaveApply: null,
    handleSave: null,
    handleReset: null
});
