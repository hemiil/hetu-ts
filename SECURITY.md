# Security

hetu-ts checks the shape of a Finnish personal identity code. A valid result does not prove that a person exists, that the code was issued, or that the holder of a credential is that person. Do not use the library as authentication or authorization.

## Reporting a vulnerability

Report a vulnerability through a private [GitHub security advisory](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/privately-report-a-security-vulnerability) for this repository.

Please do not include a real personal identity code in the report. A structurally valid fictional example, or a description of the input shape, is enough.

## Scope

In scope:

- Validation that accepts a code the specification rejects, or rejects a code the specification accepts
- Test-code generation that emits a permanent-looking individual number when the caller did not opt out of the artificial range
- Exposure of input in an error message when the library promised to keep it on `error.value`

Out of scope:

- Whether a structurally valid code belongs to a real person
- Misuse of generated test data as production or personal data
