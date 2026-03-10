import { Engine, LineEnt, MainView, initCadContainer, initLocale, registerMessages, t } from 'vjcad';

const defaultServiceUrl = "https://vjmap.com/server/api/v1";
const defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MiwiVXNlcm5hbWUiOiJhZG1pbjEiLCJOaWNrTmFtZSI6ImFkbWluMSIsIkF1dGhvcml0eUlkIjoiYWRtaW4iLCJCdWZmZXJUaW1lIjo4NjQwMCwiZXhwIjo0ODEzMjY3NjM3LCJpc3MiOiJ2am1hcCIsIm5iZiI6MTY1OTY2NjYzN30.cDXCH2ElTzU2sQU36SNHWoTYTAc4wEkVIXmBAIzWh6M";

initLocale();

registerMessages({
    'zh-CN': {
        'app.name': '唯杰WebCAD'
    },
    'en-US': {
        'app.name': 'VJMap WebCAD'
    },
});

const cadView = new MainView({
    appname: t('app.name'),
    version: "v1.0.0",
    serviceUrl: defaultServiceUrl,
    accessToken: defaultAccessToken,
    accessKey: "",
});

initCadContainer("cad-app", cadView);
