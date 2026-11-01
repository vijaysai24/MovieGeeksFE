import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { errorMessage } from "../../Services/api";
import { useGuestWishlist } from "../../Services/guestWishlist";
import { AuthLayout } from "./AuthLayout";
import { Field, TextInput } from "../UI/Field";
import { Button } from "../UI/Button";

const destination = (location) => {
  const from = location.state?.from;
  return from && from.pathname !== "/login" && from.pathname !== "/register" ? `${from.pathname}${from.search || ""}` : "/";
};

function Login() {
  const { signIn, isMember } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const guestItems = useGuestWishlist();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (isMember && !submitting) return <Navigate to={destination(location)} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { user, merged } = await signIn(email.trim(), password);
      toast.show(merged?.added ? `Welcome back, ${user.name.split(" ")[0]}. ${merged.added} saved titles added to your wishlist.` : `Welcome back, ${user.name.split(" ")[0]}`);
      navigate(destination(location), { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      intro={guestItems.length ? `The ${guestItems.length} ${guestItems.length === 1 ? "title" : "titles"} you saved on this visit will be added to your wishlist.` : "Sign in to pick up your diary where you left it."}
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Email">
          {(props) => <TextInput type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} {...props} />}
        </Field>
        <Field label="Password">
          {(props) => <TextInput type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} {...props} />}
        </Field>
        {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        <Button type="submit" variant="primary" size="lg" full disabled={submitting || !email || !password}>
          {submitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-8 text-[15px] text-muted">
        New here? <Link to="/register" state={location.state} className="text-ink hover:text-accent">Start your film diary</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
