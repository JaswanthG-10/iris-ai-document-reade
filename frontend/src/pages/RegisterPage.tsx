import React from "react";
import { LoginPage } from "./LoginPage";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
  return <LoginPage onSwitchToRegister={onSwitchToLogin} initialMode="register" />;
};

export default RegisterPage;
