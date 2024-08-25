import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Icons } from "../ui/icons";
import { authThunks } from "@/lib/features/auth/authThunks";

const AuthButton = ({
  name = "",
  email,
  password,
  role,
  type,
}: {
  name?: string;
  role?: string;
  email: string;
  password: string;
  type: "signin" | "Submit";
}) => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.auth.loading);
  const text = {
    loadingText: type === "signin" ? "Signing in..." : "Signing up...",
    buttonText: type === "signin" ? "Sign in" : "Submit",
  };

  const handleAuth = () => {
    if (type === "signin") {
      dispatch(authThunks.signin({ email, password, role }));
    } else if (type === "Submit") {
      dispatch(authThunks.signup({ name, email, role, password }));
    }
  };

  return (
    <Button
      className="w-full bg-black-950 text-white hover:bg-black-600"
      onClick={handleAuth}
      disabled={loading}
    >
      {loading && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}{" "}
      {loading ? text.loadingText : text.buttonText}
    </Button>
  );
};

export default AuthButton;
