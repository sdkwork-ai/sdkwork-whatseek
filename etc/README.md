# etc/ — Repository Source Config Index

Deployment profile index for the `sdkwork-whatseek` repository (SOURCE_CONFIG_SPEC.md).

- `sdkwork.deployment.config.json` — `kind: sdkwork.deployment-index`; declares the standalone profile family (`standalone.development` default → `standalone.production`) and maps each profile id to its `topology/<profileId>.env` identity file.
- `topology/*.env` — canonical profile identity (`SDKWORK_ENVIRONMENT`, `SDKWORK_DEPLOYMENT_PROFILE`, `SDKWORK_PROFILE_ID`, plus `SDKWORK_WHATSEEK_*` application mirrors and the registered H5 dev port).

The independently deployable surface is the H5 app root: `apps/sdkwork-whatseek-h5/etc/` owns its browser runtime sources and materialization (`check-source-config-standard.mjs --root apps/sdkwork-whatseek-h5`). Cloud profiles are intentionally absent until Phase 2 platform wiring.
