import { useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

export default function AcceptInvite() {
  const { token } = useParams();      // invite token from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        await api.post(`/invites/accept/${token}`);
        navigate("/dashboard");
      } catch (err) {
        alert("Invalid or expired invite");
        navigate("/");
      }
    };

    acceptInvite();
  }, []);

  return (
    <div className="center">
      <h2>Accepting Invite...</h2>
      <p>Please wait</p>
    </div>
  );
}
