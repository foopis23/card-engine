import { initGameServer } from './server/game/game-server';
import { initHtmlServer } from './server/html/html-server';

initHtmlServer(3000);
initGameServer(3001);
