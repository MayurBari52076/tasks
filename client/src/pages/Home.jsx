import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <div className="center">

        <h1>Collaborative Task Manager</h1>
        <p>Organize your work. Share tasks. Get more done.</p>

        <div className="home-buttons">
          <Link to="/register">
            <button>Register</button>
          </Link>

          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>

      </div>

      <Footer />
    </>
  );
}
