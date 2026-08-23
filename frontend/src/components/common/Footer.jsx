const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center py-3 mt-auto">
      <div className="container">
        <p className="mb-0">&copy; {new Date().getFullYear()} PHP LMS Project. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
