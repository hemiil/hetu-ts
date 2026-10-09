# Changelog

## 2.0.0

First public release.

- Validate a Finnish personal identity code, including the century separators in use since 2023.
- Parse a code into a calendar `BirthDate`, gender, separator, and individual number.
- Generate test codes in the artificial individual-number range 900–999 by default.
- Reject impossible calendar dates, individual numbers 000 and 001, and lowercase check characters.
