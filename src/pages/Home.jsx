import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Home</h1>
      {/* Cách 1: dùng navigate */}
      <button onClick={() => navigate("/login")}>Login</button>

      {/* Cách 2: dùng Link (nếu muốn menu) */}
      {/* <Link to="/login">Login</Link> */}
    </div>
  );
}
