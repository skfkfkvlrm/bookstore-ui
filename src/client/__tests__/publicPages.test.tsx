import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Privacy from "../pages/Privacy";
import AuthorPage from "../pages/AuthorPage";

describe("공용 페이지 렌더링", () => {
  it("About 페이지 핵심 문구를 보여준다", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    );
    expect(
      screen.getByText("지식과 사람을 연결하는 차세대 도서관")
    ).toBeInTheDocument();
    expect(screen.getByText("지식 접근성 확대")).toBeInTheDocument();
  });

  it("Privacy 페이지 섹션을 모두 노출한다", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    );
    expect(screen.getByText("1. 수집하는 정보")).toBeVisible();
    expect(screen.getByText("5. 이용자 권리")).toBeVisible();
  });

  it("Contact 페이지 폼을 제출하면 확인 메시지를 보여준다", async () => {
    render(
      <MemoryRouter>
        <Contact />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByLabelText("이름"), "테스트 사용자");
    await userEvent.type(screen.getByLabelText("이메일"), "user@test.com");
    await userEvent.selectOptions(screen.getByLabelText("문의 유형"), "서비스 이용 문의");
    await userEvent.type(screen.getByLabelText("문의 내용"), "테스트 메시지");
    await userEvent.click(screen.getByRole("button", { name: "문의 전송" }));
    expect(await screen.findByText(/접수되었습니다/)).toBeVisible();
  });

  it("Author 페이지에서 대표 도서를 노출한다", () => {
    render(
      <MemoryRouter initialEntries={["/client/authors/James%20Clear"]}>
        <Routes>
          <Route path="/client/authors/:name" element={<AuthorPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /James Clear/ })).toBeVisible();
    expect(screen.getByText(/대표 도서/)).toBeInTheDocument();
  });
});
