import { useContext } from "react";
import { useState } from "react";
import { Context } from "../index";

const LoginForm: React.FC = (): JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { store } = useContext(Context);

  return (
    <div>
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={() => store.login(email, password)}>Login</button>
      <button onClick={() => store.register(email, password)}> Register</button>
    </div>
  );
};

export default LoginForm;
