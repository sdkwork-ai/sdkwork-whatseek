# specs/

Repository-level machine contracts for `sdkwork-whatseek`. Local specs may narrow or document integration boundaries; they must not contradict the global standards in `../sdkwork-specs/`. When a local spec conflicts with `../sdkwork-specs/`, the root spec wins.

| File | Purpose |
| --- | --- |
| `component.spec.json` | Workspace component manifest (machine-readable contract). |
| `domain.yaml` | Bounded context declaration per `../sdkwork-specs/DOMAIN_SPEC.md`. |

Module-local spec systems live in each module's own `specs/` directory (e.g. `apps/sdkwork-whatseek-h5/specs/`).
