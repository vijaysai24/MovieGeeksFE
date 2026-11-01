import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useToast } from "../../Context/ToastContext";
import { errorCode, errorMessage } from "../../Services/api";
import { AuthLayout } from "./AuthLayout";
import { Field, TextInput } from "../UI/Field";
import { Button } from "../UI/Button";

const USERNAME = /^[a-z0-9_]{3,30}$/;

// The same rules the API enforces, shown before the user hits them.
const passwordProblem = (password) => {
  if (password.length < 8) return "At least 8 characters";
  if (!/[A-Za-z]/.test(password)) return "Add a letter";
  if (!/\d/.test(password)) return "Add a number";
  return null;
};

function Register() {
  const { register, isMember } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: "", username: params.get("username") || "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isMember && !submitting) return <Navigate to="/" replace />;

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const problems = {
      ...(form.name.trim() ? {} : { name: "Tell us what to call you" }),
      ...(form.username && !USERNAME.test(form.username) ? { username: "3-30 lowercase letters, numbers or underscores" } : {}),
      ...(passwordProblem(form.password) ? { password: passwordProblem(form.password) } : {}),
    };
    setFieldErrors(problems);
    if (Object.keys(problems).length) return;

    setSubmitting(true);
    setError(null);
    try {
      if (params.get("prefers")) localStorage.setItem("mg:prefers", params.get("prefers"));
      const { user, merged } = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        ...(form.username && { username: form.username }),
      });
      toast.show(merged?.added ? `Welcome, ${user.name.split(" ")[0]}. ${merged.added} saved titles are on your wishlist.` : `Welcome to Movie Geeks, ${user.name.split(" ")[0]}`);
      navigate(location.state?.from?.pathname || `/u/${user.username}`, { replace: true });
    } catch (err) {
      const code = errorCode(err);
      if (code === "USERNAME_TAKEN") setFieldErrors({ username: "That username is taken" });
      else if (code === "EMAIL_TAKEN") setFieldErrors({ email: "That email already has an account" });
      else setError(errorMessage(err, "Couldn't create your account."));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Start your film diary" intro="Free. Anything you saved before signing up comes with you.">
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Field label="Your name" error={fieldErrors.name}>
          {(props) => <TextInput autoComplete="name" required maxLength={80} value={form.name} onChange={update("name")} {...props} />}
        </Field>
        <Field label="Username" hint="Lowercase letters, numbers and underscores. Leave it blank and we'll pick one." error={fieldErrors.username}>
          {(props) => (
            <TextInput
              autoComplete="username"
              maxLength={30}
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value.toLowerCase().replace(/\s/g, "") }))}
              {...props}
            />
          )}
        </Field>
        <Field label="Email" error={fieldErrors.email}>
          {(props) => <TextInput type="email" autoComplete="email" required value={form.email} onChange={update("email")} {...props} />}
        </Field>
        <Field label="Password" hint="At least 8 characters, with a letter and a number." error={fieldErrors.password}>
          {(props) => <TextInput type="password" autoComplete="new-password" required value={form.password} onChange={update("password")} {...props} />}
        </Field>
        {error && <p className="text-sm text-negative" role="alert">{error}</p>}
        <Button type="submit" variant="primary" size="lg" full disabled={submitting}>
          {submitting ? "Creating your diary..." : "Create account"}
        </Button>
      </form>
      <p className="mt-8 text-[15px] text-muted">
        Already have one? <Link to="/login" state={location.state} className="text-ink hover:text-accent">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

export default Register;
