import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Context } from ".";
import LoginForm from "./components/LoginForm";
import { IUser } from "./interfaces/user";
import UserService from "./services/user";

const App: React.FC = (): JSX.Element => {
  const [users, setUsers] = useState<IUser[]>([]);
  const { store } = useContext(Context);
  useEffect(() => {
    if (localStorage.getItem("token")) {
      store.checkAuth();
    }
  }, []);
  async function getUsers() {
    try {
      const response = await UserService.fetchUsers();
      setUsers(response.data);
    } catch (e: any) {}
  }
  return (
    <>
      <h1>
        {store.isAuth
          ? `Пользователь ${store.user.email} авторизован`
          : `Авторизуйтесь`}
      </h1>
      <LoginForm />
      <button onClick={store.logout}>Выйти</button>
      <button onClick={getUsers}>Получить список пользователей</button>
      {users.map((user) => (
        <div key={user.id}>{user.email}</div>
      ))}
    </>
  );
};

export default observer(App);
