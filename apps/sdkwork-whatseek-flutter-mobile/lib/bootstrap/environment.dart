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
  });

  final String environment;
  final String deploymentProfile;
  final String profileId;
  final String runtimeTarget;

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
    if (profileId.isEmpty) {
      return fallback;
    }
    return const WhatseekRuntimeEnvironment(
      environment: environment,
      deploymentProfile: deploymentProfile,
      profileId: profileId,
      runtimeTarget: runtimeTarget,
    );
  }
}
