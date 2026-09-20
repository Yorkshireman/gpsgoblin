# `fit-file-parser` profile-table licence review

Checked **20 September 2026** for [ticket #55](https://github.com/Yorkshireman/gpsgoblin/issues/55). This is technical provenance and licence research, not legal advice.

## Decision

Do **not** adopt `fit-file-parser@5.2.1` on the assumption that its Garmin-derived profile tables are safely redistributable under MIT.

The package has a clear MIT declaration from its publisher, but that declaration is not a clear chain of permission for the generated profile data. The project records that it mechanically generates the tables from `@garmin/fitsdk@21.208.0`. Garmin's source file carries Garmin's copyright and FIT Protocol License notice, while that licence restricts distributing the Licensed Technology or derivatives under terms that let recipients modify them. The published `fit-file-parser` tarball instead contains the generated tables under one MIT file and contains neither Garmin's FIT licence nor evidence of separate permission.

There may be legal arguments that some or all protocol identifiers and numeric mappings are unprotectable facts or interoperability information, and that a downstream package user did not agree to Garmin's SDK contract. This inspection cannot resolve those arguments. They are not a sufficiently strong basis for GPSGoblin to treat the MIT label alone as clearing a public browser distribution, particularly now that the direct derivation is documented.

The dependency gate therefore remains **failed pending either written Garmin permission covering these generated tables or qualified legal advice accepting the provenance risk**. Garmin's answer about the official SDK should also be asked to cover third-party packages that publish transformed copies of `Profile.messages` and `Profile.types`.

## Exact artifact inspected

The release GPSGoblin would select from npm today is **`fit-file-parser@5.2.1`**: npm's `latest` tag points to 5.2.1, published at `2026-09-17T10:44:56.577Z`. The registry identifies source commit [`baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf`](https://github.com/jimmykane/fit-parser/commit/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf), and tag [`v5.2.1`](https://github.com/jimmykane/fit-parser/tree/v5.2.1) resolves to that commit. The npm provenance attestation also identifies that commit and the repository's `publish.yml` workflow. Sources: [package index](https://registry.npmjs.org/fit-file-parser), [5.2.1 registry record](https://registry.npmjs.org/fit-file-parser/5.2.1), [npm attestations](https://registry.npmjs.org/-/npm/v1/attestations/fit-file-parser@5.2.1).

The inspected [published tarball](https://registry.npmjs.org/fit-file-parser/-/fit-file-parser-5.2.1.tgz) has:

- npm integrity: `sha512-7KBHcY9I6GmfpYDq4iL/ESxmMSl5da4MOWBKKXYIZwsK5TLgX7hNAce2O/5ZzHKdSEL58hfDhuEnraXndoWEbQ==`
- verified SHA-512: `eca047718f48e8699fa580eae222ff112c6631297975ae0c39604a297608670b0ae532e05fb84d01c7b63bfe59cc729d4842f9f217c386e127ada5e77685846d`
- verified SHA-1: `77fff498986fad79f1e1ba914fc27977dfe80e60`, matching npm's `dist.shasum`
- 46 files and 1,473,408 bytes unpacked, matching npm's registry record

These checks establish which bytes were reviewed. They authenticate package provenance; they do not validate the publisher's right to license every byte as MIT.

## Provenance of the profile tables

The provenance is direct rather than speculative:

1. The release pins `@garmin/fitsdk` version `21.208.0` as a development dependency in both its [`package.json`](https://raw.githubusercontent.com/jimmykane/fit-parser/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf/package.json) and [`package-lock.json`](https://raw.githubusercontent.com/jimmykane/fit-parser/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf/package-lock.json).
2. Its [`codegen/garmin-profile.ts`](https://raw.githubusercontent.com/jimmykane/fit-parser/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf/codegen/garmin-profile.ts) imports `Profile` from `@garmin/fitsdk`, enumerates `Profile.messages` and `Profile.types`, normalizes names to snake case, selects field metadata, and serializes both objects into `src/garmin_profile.generated.ts`.
3. The committed [generated source](https://raw.githubusercontent.com/jimmykane/fit-parser/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf/src/garmin_profile.generated.ts) says it was generated from `@garmin/fitsdk 21.208.0`.
4. Garmin's tagged [`src/profile.js`](https://raw.githubusercontent.com/garmin/fit-javascript-sdk/21.208.0/src/profile.js) identifies itself as copyright 2026 Garmin International, says it is licensed under the FIT Protocol License, and identifies profile version 21.208.0.
5. Repository history corroborates the intent. Commit [`1c2a8bf`](https://github.com/jimmykane/fit-parser/commit/1c2a8bf2de8a406555bac387e64bc427c0dd88f5) introduced the generator with the changelog description “Generate all standard messages, fields, and enum additions from the pinned Garmin SDK profile.” Commit [`f21f02f`](https://github.com/jimmykane/fit-parser/commit/f21f02f46cd24a54f9f5790ce993b70f8f9f2b84) later described the 5.0 output as the complete standard surface from the pinned SDK without handwritten overrides.

The transformation is narrower than copying Garmin's entire `profile.js`, but it is substantial and systematic. In the npm tarball, `dist/garmin_profile.generated.js` is 459,705 bytes and contains 124 messages, 1,406 fields, 200 types and 4,401 enum values. It preserves identifiers, numeric IDs, base types, array flags, scales, offsets and units from Garmin's data while omitting other SDK properties. The generated TypeScript declarations also reproduce names from those tables.

## What the published package actually licenses

### Facts

- npm metadata and the published `package.json` declare `MIT`. The sole licence file in the tarball is the project's [`LICENSE`](https://raw.githubusercontent.com/jimmykane/fit-parser/baafe7ad1d7ffa5cefd117ae6acc1f03ace733cf/LICENSE), which grants MIT rights and carries Pierre Jacquier's 2015 copyright.
- The tarball contains no `NOTICE`, no Garmin FIT Protocol License, and no separate grant from Garmin. The compiled `dist/garmin_profile.generated.js` also lacks the generated source file's comment naming `@garmin/fitsdk` as its source.
- `@garmin/fitsdk` is a development dependency, not a runtime dependency. Installing `fit-file-parser@5.2.1` therefore supplies the generated data but does not install Garmin's package or its `LICENSE.txt`.
- Garmin's exact SDK package declares `SEE LICENSE IN LICENSE.txt`; its [FIT Protocol License](https://raw.githubusercontent.com/garmin/fit-javascript-sdk/21.208.0/LICENSE.txt) defines the Licensed Technology as the SDK, including protocol documentation and related source files. It gives a limited, non-transferable and non-sublicensable internal-business-use grant.
- Section 2(c) restricts distributing, publishing or otherwise making the Licensed Technology or its functionality available to third parties. Section 2(d) restricts distributing the Licensed Technology or derivatives so that recipients receive source-disclosure or modification rights. MIT expressly grants rights to copy, modify, distribute and sublicense. Garmin also labels the Licensed Technology confidential, subject to stated exclusions.

### Inferences

- The package publisher plainly intends the MIT declaration to cover the npm package as a whole, including `dist/garmin_profile.generated.js`; there is no file-level exclusion. A normal npm consumer therefore receives an apparent MIT offer from the publisher.
- That apparent offer does not itself prove that the publisher had authority to relicense Garmin-derived material. If the emitted tables are Licensed Technology, a Modification, a derivative, protected database content, or otherwise controlled by Garmin, the generator's mechanical normalization does not supply the missing sublicensing right.
- Section 2(d) is especially difficult to reconcile with placing a Garmin derivative under MIT because the two clauses address exactly the downstream right to modify. Keeping Garmin attribution would not cure that incompatibility.
- Conversely, protocol numbers, measurements, identifiers and compatibility mappings have a strong factual or functional character. A court could find some or all individual elements outside copyright protection, or could limit protection to Garmin's original selection or arrangement. The generator also discards substantial SDK structure and presents a different arrangement. Those considerations reduce certainty about an infringement claim, but do not answer the publisher's contractual obligations or provide GPSGoblin with affirmative permission.
- npm signatures and provenance attestations prove who published which artifact from which source workflow. They are supply-chain evidence, not a licence audit or warranty of non-infringement.

### Unresolved legal risk

The public sources do not establish:

- whether the maintainer obtained separate permission from Garmin;
- whether Garmin considers these normalized tables a permitted use, a Modification, or a prohibited distribution;
- which elements of the profile would receive copyright or database protection in each relevant jurisdiction;
- whether and how Garmin's SDK contract could affect a downstream user that installs only `fit-file-parser`; or
- whether an interoperability or other statutory exception applies to this particular extraction and distribution.

The MIT licence also disclaims non-infringement warranties. It shifts this uncertainty to consumers rather than resolving it.

## Practical consequence for GPSGoblin

Bundling `fit-file-parser@5.2.1` into client-side JavaScript would redistribute its generated Garmin tables to every visitor. On the evidence available, GPSGoblin cannot make the ticket's dependency decision on “npm says MIT” alone.

Acceptable ways to reopen the candidate are:

1. Garmin gives written permission covering the generated `Profile.messages` and `Profile.types` tables in a public, potentially advertising-supported browser application and their distribution under the package's MIT terms.
2. A qualified lawyer reviews the exact artifact and accepts the factual/functional-data and downstream-contract arguments for the jurisdictions in scope.
3. The package replaces the Garmin-derived tables with demonstrably independently sourced data under compatible terms, with an auditable clean provenance trail.

Until one of those occurs, `fit-file-parser@5.2.1` should not be treated as a lower-risk workaround for the official SDK.
