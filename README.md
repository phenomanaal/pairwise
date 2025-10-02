## PairWise

This is a project created for OSET, using Next.js, Tailwind & TypeScript.

## API Mocking

Currently the code is calling a mock api that users can host locally using Mockoon desktop or CLI (free). A `mockoon.json` file has been provided for configuration.

Install the `mockoon-cli` application here: [Mockoon CLI](https://mockoon.com/cli/)

## Running In Development

To run the application:

```bash
./start.sh
```

This script runs the following in one command:

```bash
mockoon-cli start --data mockoon.json
```

This runs a mock server on port 4000, to change this edit the `mockoon.json` file.

Then it starts the application:

```bash
pnpm run dev
```

if you don't have `pnpm`, it will run the following:

```bash
npm run dev
```

When the script is running go to `localhost:3000/login` (or whichever port you choose to run node on) to preview the application.

## testing

### login credentials

username: validUser
OTP: 123456
access code: 098675

### test files

- voter file: test-voter-file.csv
- external files: test-external-file-<n>.csv

## Resources

#### Internal

- [pairwise conops & workflow](https://docs.google.com/document/d/1JIL2kQANz_pyP2Z-YCqlTyn5595EyPsQnsGMst7a39o/edit?usp=sharing)
- [wireframes](https://www.figma.com/design/25k6fBGSBYl8rezSaTsyB9/PairWise-Wireframes?node-id=1015170-1451&t=wcGBJeYdb9x7uQe5-1)

#### External

- [next.js documentation](https://nextjs.org/docs)
- [react documentation](https://react.dev/reference/react)
- [tailwind documentation](https://tailwindcss.com/docs)


notes:
complete happy path! no download all button, have output filename generated so that it's clear that it's different from the external file name

token shake are you done? if so then --> url to S3 bucket
security --> access control is normally done through filename cryptography
in this case --> predictable url, giving to you for about a minute, download, finish download (if you don't finish within 5 minutes) short lived link
downloading specific file --> this is the specific file

errors --> all errors (unhappy paths)
matching error, download errors, download again

uploading input files, file validation (filetype, empty file, lacking in fields) if there is communication error between client and server, communicate oops (try again)

separetly if file didn't validate --> invalid file with link to static page (user help on what file contents should be)
milestone & metric: various unhappy paths
strings files: yaml with strings for placeholders for different messages
find CSS person
artifacts for output
mimic css for state elections website
