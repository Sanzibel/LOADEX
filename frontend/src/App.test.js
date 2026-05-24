import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock(
  "react-router-dom",
  () => ({
    BrowserRouter: ({ children }) => <>{children}</>,
    Routes: ({ children }) => <>{children}</>,
    Route: ({ element }) => element,
    Navigate: ({ to }) => <div>Redirect to {to}</div>,
    useLocation: () => ({ pathname: "/login" }),
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: "1" }),
  }),
  { virtual: true }
);

test("renders the LOADEX auth shell", () => {
  render(<App />);

  expect(screen.getByText("LOADEX")).toBeInTheDocument();
});
