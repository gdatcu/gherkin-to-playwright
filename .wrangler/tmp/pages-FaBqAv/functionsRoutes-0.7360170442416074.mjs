import { onRequestPost as __api_convert_ts_onRequestPost } from "C:\\Users\\George\\dev\\gherkin-converter\\functions\\api\\convert.ts"

export const routes = [
    {
      routePath: "/api/convert",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_convert_ts_onRequestPost],
    },
  ]