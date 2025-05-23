import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./AuthPage.scss";

export default function AuthPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Используем переменные окружения для адреса API
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const changeHandler = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const endpoint = isLogin ? "login" : "registration";
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/${endpoint}`,
        form,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Для продакшена сохраняем токен в localStorage
      if (isLogin && response.data.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (isLogin) {
        login(response.data.token);
        navigate("/");
      } else {
        setErrorMessage("Регистрация успешна! Войдите в систему.");
        setIsLogin(true);
        setForm({ email: "", password: "" });
      }
    } catch (error) {
      let message = "Ошибка соединения";
      
      // Детальная обработка ошибок сети
      if (error.code === "ERR_NETWORK") {
        message = `Сервер недоступен! Проверьте:
        1. Сервер должен быть доступен по адресу: ${API_URL}
        2. CORS должен разрешать запросы с: ${window.location.origin}
        3. Сервер должен принимать HTTPS-запросы`;
      } else if (error.response?.status === 401) {
        message = "Неверный email или пароль";
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setErrorMessage(message);
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h3 className="auth-title">{isLogin ? "Вход" : "Регистрация"}</h3>
          {errorMessage && (
            <div className={`auth-error ${!isLogin && "success"}`}>
              {errorMessage}
              {errorMessage.includes("Ошибка") && (
                <div className="auth-error-hint">Проверьте введенные данные</div>
              )}
            </div>
          )}
        </div>

        <form className="auth-form" onSubmit={handleAuth}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="Email"
              value={form.email}
              onChange={changeHandler}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="Пароль"
              value={form.password}
              onChange={changeHandler}
              required
              minLength="6"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
          </div>

          <div className="auth-actions">
            <button
              type="submit"
              className="auth-button primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="auth-spinner">Загрузка...</span>
              ) : isLogin ? (
                "Войти"
              ) : (
                "Зарегистрироваться"
              )}
            </button>

            <button
              type="button"
              className="auth-button secondary"
              onClick={() => !isLoading && setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              {isLogin ? "Создать аккаунт" : "Уже есть аккаунт?"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}