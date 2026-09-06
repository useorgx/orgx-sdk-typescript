# OrgX TypeScript SDK release

## Verified status — September 6, 2026

Version 1.1.0 builds and passes its SDK tests. [Publish run 33984264605](https://github.com/useorgx/orgx-sdk-typescript/actions/runs/33984264605) failed at npm authentication with `ENEEDAUTH`; `NODE_AUTH_TOKEN` was empty. A verified source release is not a published registry release.

## Required account setup

The current workflow maps the GitHub Actions secret `NPM_TOKEN` to `NODE_AUTH_TOKEN`.
An npm package owner must supply a valid publishing credential for `@useorgx/sdk`
in [repository Actions secrets](https://github.com/useorgx/orgx-sdk-typescript/settings/secrets/actions).
Use a package-scoped credential with write permission and the unattended-publishing
settings required by npm. Do not paste credentials into issues, logs, or source.

See [npm's CI publishing guidance](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow/).
npm recommends trusted publishing; switching to that path also requires package-side
publisher registration and a compatible npm CLI. The current workflow uses the
token path, so setting GitHub `id-token: write` alone does not resolve this failure.

## Resume and verify

After account setup, rerun the failed release job once. Its existing preflight
checks package/version availability, then the workflow builds, tests, checks the
release ref against the package version, and publishes with provenance.
If the version already exists, inspect its provenance instead of overwriting it
or incrementing the version solely to bypass the check.

Confirm version 1.1.0 in the registry and install that exact registry version in
an isolated directory. Check the exported `OrgXClient` and continuation methods,
then run the scoped live continuation acceptance check before marking publication
complete. Keep source verification, registry publication, and production acceptance
as separate evidence. Do not retry while authentication is unchanged.
