import { menuNodes } from "./menu";

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
// ng build --environment="prod" or "dev"
export const environment = {
  production: false,
  APIURL: 'https://lfservicewithauthdev.azurewebsites.net',
  clientId: '993f8836-ce5a-41c7-8ba5-9a483c4a35d3',
  applicationId: 'c7b05c25-6fa7-4c9d-b453-1fe02ac3b1fe',
  subscriptionKey: '3f163320fbd44deab4eae424d3517deb',  
  superAdm: 'guomei@microsoft.com, v-loyua@microsoft.com, yuma@microsoft.com',
  mainMenu: menuNodes,
};
