<p align="center">
  <a href="https://github.com/muchobien/configure-aws-secrets-manager/actions/workflows/codeql-analysis.yml"><img src="https://github.com/muchobien/configure-aws-secrets-manager/actions/workflows/codeql-analysis.yml/badge.svg?branch=main" alt="CodeQL"></a>
<a href="https://github.com/muchobien/configure-aws-secrets-manager/actions/workflows/test.yml"><img src="https://github.com/muchobien/configure-aws-secrets-manager/actions/workflows/test.yml/badge.svg?branch=main" alt="build-test"></a>
</p>

# "Configure AWS Secrets Manager" Action For GitHub Actions

A Github action to load secrets from AWS Secrets Manager into the environment

## Usage

Add the following step to your workflow:

```yaml
- name: Configure AWS Secrets Manager
  uses: muchobien/configure-aws-secrets-manager@v2
  with:
    secret-id: mysecret
    version-id: someversion # optional
    stage: dev # optional
    exporters: env,output,file # default, optional
    overrides: 'false' # optional, default false (override existing environment variables)
    file-path: ./.env # optional, default ./.env
```

## License Summary

This code is made available under the MIT license.
