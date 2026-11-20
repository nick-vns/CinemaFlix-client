import React from "react";
import { LoginView } from "../login-view/login-view.jsx";

export function SignupView(props) {
  return <LoginView {...props} register />;
}
