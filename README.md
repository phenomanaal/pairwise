## PairWise

This is a project created for OSET, using Next.js, Tailwind & TypeScript.

## API Mocking

Currently the code is calling a mock api that users can host locally using Mockoon desktop or CLI (free). A `mockoon.json` file has been provided for configuration.

Install the `mockoon-cli` application here: [Mockoon CLI](https://mockoon.com/cli/)

## Running In Development

To run the application:

```bash
npm run dev
```

To run the mockoon server to mock API calls:
```bash
mockoon-cli start --data mockoon.json
```
This runs on port 4000, to change this edit the `mockoon.json` file.

With both those running go to `localhost:3000/login` (or whichever port you choose to run node on ) to preview the application.

## Resources

#### Internal
- [pairwise conops & workflow](https://docs.google.com/document/d/1JIL2kQANz_pyP2Z-YCqlTyn5595EyPsQnsGMst7a39o/edit?usp=sharing)
- [wireframes](https://www.figma.com/design/25k6fBGSBYl8rezSaTsyB9/PairWise-Wireframes?node-id=1015170-1451&t=wcGBJeYdb9x7uQe5-1)

#### External
- [next.js documentation](https://nextjs.org/docs)
- [react documentation](https://react.dev/reference/react)
- [tailwind documentation](https://tailwindcss.com/docs)
- [mockoon documentation](https://mockoon.com/docs/latest/about/)
