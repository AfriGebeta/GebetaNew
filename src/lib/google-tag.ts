export const GTM_ID = "GTM-5HCNJ22N";

export const GTM_SRC = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;

// Sets up the dataLayer before gtm.js loads. The `gtm.js` event is what fires
// the container's page-view triggers; the gtag lines are the snippet from marketing.
export const GTM_INLINE_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});gtag('js',new Date());`;
