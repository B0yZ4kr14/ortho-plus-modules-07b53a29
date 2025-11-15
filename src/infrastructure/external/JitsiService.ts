/**
 * Jitsi Meet Integration Service
 * Gera links de videoconferência para Teleodontologia
 */

interface JitsiConfig {
  domain: string;
  roomPrefix: string;
}

interface JitsiRoomOptions {
  roomName: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  subject?: string;
  password?: string;
}

export class JitsiService {
  private config: JitsiConfig = {
    domain: 'meet.jit.si',
    roomPrefix: 'orthoplus-teleodonto',
  };

  /**
   * Gera um link único de Jitsi para uma sessão
   */
  generateRoomLink(sessionId: string, clinicId: string): string {
    const roomName = `${this.config.roomPrefix}-${clinicId}-${sessionId}`;
    return `https://${this.config.domain}/${roomName}`;
  }

  /**
   * Gera configuração completa para iniciar uma sala Jitsi
   */
  generateRoomConfig(options: JitsiRoomOptions): any {
    return {
      roomName: options.roomName,
      width: '100%',
      height: '100%',
      parentNode: undefined, // Será setado pelo componente React
      configOverwrite: {
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        SHOW_BRAND_WATERMARK: false,
        BRAND_WATERMARK_LINK: '',
        SHOW_POWERED_BY: false,
        DISPLAY_WELCOME_FOOTER: false,
        TOOLBAR_BUTTONS: [
          'microphone',
          'camera',
          'closedcaptions',
          'desktop',
          'fullscreen',
          'fodeviceselection',
          'hangup',
          'chat',
          'recording',
          'livestreaming',
          'etherpad',
          'sharedvideo',
          'settings',
          'raisehand',
          'videoquality',
          'filmstrip',
          'stats',
          'shortcuts',
          'tileview',
          'download',
          'help',
        ],
      },
      userInfo: {
        displayName: options.displayName,
        email: options.email,
      },
    };
  }

  /**
   * Valida se um link Jitsi é válido
   */
  validateRoomLink(link: string): boolean {
    const pattern = new RegExp(
      `^https://${this.config.domain}/${this.config.roomPrefix}-[a-f0-9\\-]+$`,
      'i'
    );
    return pattern.test(link);
  }

  /**
   * Extrai o room name de um link Jitsi
   */
  extractRoomName(link: string): string | null {
    const match = link.match(/https:\/\/[^\/]+\/(.+)/);
    return match ? match[1] : null;
  }
}
