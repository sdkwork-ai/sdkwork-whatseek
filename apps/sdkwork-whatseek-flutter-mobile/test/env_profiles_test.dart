// Runtime env profile contract (SOURCE_CONFIG_SPEC.md, H5
// `keeps_runtime_env_sources_identity_exact_and_secret_free` parity): the
// committed env profiles stay identity-exact and secret-free — the
// credential-bearing sdkwork-im / sdkwork-appstore driver bridge keys must
// be empty strings in every committed profile (minted credentials only ever
// live in LOCAL uncommitted profile copies).
import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

void main() {
  test('env_profiles_stay_identity_exact_and_secret_free', () {
    final credentialPattern =
        RegExp(r'token|secret|password|apikey|api_key', caseSensitive: false);
    const profiles = ['development', 'test', 'staging', 'production'];
    for (final profile in profiles) {
      final file = File('env/sdkwork.standalone.$profile.json');
      expect(file.existsSync(), isTrue, reason: 'missing env profile $profile');
      final doc =
          jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
      expect(
        doc['SDKWORK_PROFILE_ID'],
        'standalone.$profile',
        reason: 'profile identity drift in $profile',
      );
      for (final entry in doc.entries) {
        if (credentialPattern.hasMatch(entry.key)) {
          expect(
            entry.value,
            '',
            reason: '$profile:${entry.key} must stay empty in committed profiles',
          );
        } else if (entry.value is String) {
          expect(
            entry.value as String,
            isNot(contains('token')),
            reason: '$profile:${entry.key} must not carry secret-looking content',
          );
        }
      }
    }
  });
}
