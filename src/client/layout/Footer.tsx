import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#f6f7f8] dark:bg-[#101922] border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-500 dark:text-gray-400">
        <div className="flex justify-center gap-6 mb-4">
          <Link to="/client/about" className="text-sm hover:text-[#1173d4]">
            서비스 소개
          </Link>
          <Link to="/client/contact" className="text-sm hover:text-[#1173d4]">
            문의하기
          </Link>
          <Link to="/client/privacy" className="text-sm hover:text-[#1173d4]">
            개인정보처리방침
          </Link>
        </div>
        <p className="text-sm mb-2">© 2025 스프링 도서관. 모든 권리를 보유합니다.</p>
        <div className="flex justify-center items-center gap-2 text-xs">
          <span>제공</span>
          <a
            href="https://electrowave.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1173d4] hover:underline font-medium"
          >
            electrowave.kr
          </a>
          <span>|</span>
          <span>개발 goodjwon & skfkfkvlrm</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
