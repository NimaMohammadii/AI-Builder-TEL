import app from './index';
import './vexa-voice-target-user-routes';
import { registerVexaVoiceMessageRoutes } from './vexa-voice-message-api';

registerVexaVoiceMessageRoutes(app as never);
