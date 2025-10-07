const Footer = () => {
  return (
    <footer className="text-center p-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a2632]">
      <p className="mb-2">© 2025 Spring Library System. All rights reserved.</p>
      <div className="flex justify-center items-center gap-2 text-xs">
        <span>Powered by</span>
        <a
          href="https://electrowave.kr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1173d4] hover:underline font-medium"
        >
          electrowave.kr
        </a>
        <span>|</span>
        <span>Developed by goodjwon & skfkfkvlrm</span>
      </div>
    </footer>
  );
};

export default Footer;
