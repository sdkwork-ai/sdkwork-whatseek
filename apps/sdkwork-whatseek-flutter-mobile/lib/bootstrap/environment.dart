/// Runtime environment for the Flutter surface — identity keys injected via
/// `--dart-define-from-file env/sdkwork.<profileId>.json`
/// (FLUTTER_APP_MOBILE_ARCHITECTURE_SPEC.md §Config).
library;

class WhatseekRuntimeEnvironment {
  const WhatseekRuntimeEnvironment({
    required this.environment,
    required this.deploymentProfile,
    required this.profileId,
    required this.runtimeTarget,
    this.sdkworkImApiBaseUrl,
    this.sdkworkImWebSocketBaseUrl,
    this.sdkworkImBootstrapAccessToken,
    this.sdkworkImBootstrapAuthToken,
  });

  final String environment;
  final String deploymentProfile;
  final String profileId;
  final String runtimeTarget;

  /// sdkwork-im driver (messages + contacts capabilities): absolute gateway
  /// base URL (`/im/v3/api` family). Empty/absent keeps the mock clients
  /// (standalone milestone default); the Flutter runtime has no same-origin
  /// concept, so a relative path cannot resolve.
  final String? sdkworkImApiBaseUrl;

  /// Explicit CCP websocket base (`wss://…`); derived by the SDK when absent.
  final String? sdkworkImWebSocketBaseUrl;

  /// Pre-minted IAM session for the composed IM client's shared TokenManager
  /// (dual-token `Access-Token`/`Auth-Token` headers). Dev/operator bridge
  /// until the IAM login runtime lands on this surface: tokens come from the
  /// gateway's own IAM credential-entry surface (`POST /app/v3/api/auth/sessions`).
  /// Null (all committed env profiles) starts the session empty — the gateway
  /// rejects unauthenticated calls.
  final String? sdkworkImBootstrapAccessToken;

  /// Dual-token auth half paired with [sdkworkImBootstrapAccessToken].
  final String? sdkworkImBootstrapAuthToken;

  static const WhatseekRuntimeEnvironment fallback = WhatseekRuntimeEnvironment(
    environment: 'development',
    deploymentProfile: 'standalone',
    profileId: 'standalone.development',
    runtimeTarget: 'flutter-android',
  );

  /// Reads the dart-define identity keys; falls back to
  /// standalone.development when launched without an env file.
  static WhatseekRuntimeEnvironment fromDefines() {
    const environment = String.fromEnvironment('SDKWORK_ENVIRONMENT');
    const deploymentProfile = String.fromEnvironment('SDKWORK_DEPLOYMENT_PROFILE');
    const profileId = String.fromEnvironment('SDKWORK_PROFILE_ID');
    const runtimeTarget = String.fromEnvironment('SDKWORK_RUNTIME_TARGET');
    // Dart defines cannot be interpolated into non-const contexts before the
    // fallback decision, so the optional IM keys are read unconditionally and
    // normalized to null when empty.
    const imApiBaseUrl = String.fromEnvironment('SDKWORK_IM_API_BASE_URL');
    const imWebSocketBaseUrl = String.fromEnvironment('SDKWORK_IM_WEB_SOCKET_BASE_URL');
    const imBootstrapAccessToken = String.fromEnvironment('SDKWORK_IM_BOOTSTRAP_ACCESS_TOKEN');
    const imBootstrapAuthToken = String.fromEnvironment('SDKWORK_IM_BOOTSTRAP_AUTH_TOKEN');
    if (profileId.isEmpty) {
      return fallback;
    }
    return WhatseekRuntimeEnvironment(
      environment: environment,
      deploymentProfile: deploymentProfile,
      profileId: profileId,
      runtimeTarget: runtimeTarget,
      sdkworkImApiBaseUrl: imApiBaseUrl.isEmpty ? null : imApiBaseUrl,
      sdkworkImWebSocketBaseUrl: imWebSocketBaseUrl.isEmpty ? null : imWebSocketBaseUrl,
      sdkworkImBootstrapAccessToken: imBootstrapAccessToken.isEmpty ? null : imBootstrapAccessToken,
      sdkworkImBootstrapAuthToken: imBootstrapAuthToken.isEmpty ? null : imBootstrapAuthToken,
    );
  }
}
